import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Game } from "@/models/Game";
import { WordPool } from "@/models/WordPool"; // Imported WordPool model

interface RouteParams {
    params: Promise<{ code: string }> | { code: string };
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const roomCode = resolvedParams.code.toUpperCase();

        const { action, playerId, ...extra } = await request.json();

        const game = await Game.findOne({ roomCode });
        if (!game) {
            return NextResponse.json({ message: "A szoba nem található" }, { status: 404 });
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player && action !== "LEAVE_ROOM") {
            return NextResponse.json({ message: "Nem vagy a szoba tagja" }, { status: 403 });
        }

        // --- START_GAME ---
        if (action === "START_GAME") {
            if (!player?.isHost) {
                return NextResponse.json({ message: "Csak a host indíthatja el a játékot!" }, { status: 403 });
            }
            if (game.players.length < 3) {
                return NextResponse.json({ message: "Legalább 3 játékos szükséges!" }, { status: 400 });
            }

            let selectedWord = null;

            // 1. Query a random word/category pair from the MongoDB WordPool collection
            try {
                const count = await WordPool.countDocuments();
                if (count > 0) {
                    const randomIndex = Math.floor(Math.random() * count);
                    selectedWord = await WordPool.findOne().skip(randomIndex);
                }
            } catch (err) {
                console.error("Nem sikerült lekérni szót a WordPool-ból, fallback használata:", err);
            }

            // 2. Local fallback list in case the database collection is empty
            if (!selectedWord) {
                const fallbackDictionary = [
                    { category: "Állatok", secretWord: "TEHÉN", hint: "FALU" },
                    { category: "Tárgyak", secretWord: "LÁMPA", hint: "FÉNY" },
                    { category: "Étel és ital", secretWord: "RIZS", hint: "ÁZSIA" }
                ];
                selectedWord = fallbackDictionary[Math.floor(Math.random() * fallbackDictionary.length)];
            }

            const impostorIndex = Math.floor(Math.random() * game.players.length);

            game.category = selectedWord.category;
            game.secretWord = selectedWord.secretWord;
            game.hint = selectedWord.hint;

            game.startedAt = new Date();
            game.endedAt = undefined; // Clear old timestamp on replay

            game.players.forEach((p, idx) => {
                p.role = idx === impostorIndex ? "IMPOSTOR" : "CIVIL";
                p.isEliminated = false;
                p.submittedWord = "";
                p.votedFor = null;
                p.hasVoted = false;
                p.isReady = false; // Added
            });

            game.turnOrder = shuffleArray(game.players.map(p => p.id));
            game.currentTurnIndex = 0;
            game.status = "REVEAL";
        }

        // --- PROCEED_TO_PLAY ---
        else if (action === "PROCEED_TO_PLAY") {
            if (!player?.isHost) {
                return NextResponse.json({ message: "Csak a host léptethet" }, { status: 403 });
            }
            game.status = "PLAYING";
        }

        // --- SUBMIT_WORD ---
        else if (action === "SUBMIT_WORD") {
            const activePlayerId = game.turnOrder[game.currentTurnIndex];
            if (activePlayerId !== playerId) {
                return NextResponse.json({ message: "Nem a te köröd van!" }, { status: 400 });
            }

            const { word } = extra;
            if (!word || typeof word !== "string" || !word.trim()) {
                return NextResponse.json({ message: "Hibás asszociációs szó" }, { status: 400 });
            }

            if (player) {
                player.submittedWord = word.trim();
            }

            game.currentTurnIndex += 1;

            if (game.currentTurnIndex >= game.turnOrder.length) {
                game.status = "VOTING";
            }
        }

        // --- CAST_VOTE ---
        else if (action === "CAST_VOTE") {
            if (player?.isEliminated) {
                return NextResponse.json({ message: "Kiesett játékos nem szavazhat!" }, { status: 400 });
            }

            const { targetId } = extra;
            if (player) {
                player.votedFor = targetId;
                player.hasVoted = true;
            }

            const activePlayers = game.players.filter(p => !p.isEliminated);
            const allVoted = activePlayers.every(p => p.hasVoted);

            if (allVoted) {
                const voteCounts: Record<string, number> = {};
                activePlayers.forEach(p => {
                    if (p.votedFor) {
                        voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1;
                    }
                });

                const candidates = [...activePlayers.map(p => p.id), "NOT_SURE"];
                let maxVotes = -1;
                let winnerId = "";
                let isTie = false;

                candidates.forEach(id => {
                    const count = voteCounts[id] || 0;
                    if (count > maxVotes) {
                        maxVotes = count;
                        winnerId = id;
                        isTie = false;
                    } else if (count === maxVotes && count > 0) {
                        isTie = true;
                    }
                });

                if (winnerId === "NOT_SURE" || isTie) {
                    game.players.forEach(p => {
                        p.submittedWord = "";
                        p.votedFor = null;
                        p.hasVoted = false;
                    });
                    game.turnOrder = shuffleArray(game.players.filter(p => !p.isEliminated).map(p => p.id));
                    game.currentTurnIndex = 0;
                    game.status = "PLAYING";
                } else {
                    const targetPlayer = game.players.find(p => p.id === winnerId);
                    if (targetPlayer) {
                        targetPlayer.isEliminated = true;

                        const remainingCivilians = game.players.filter(p => !p.isEliminated && p.role === "CIVIL");
                        const remainingImpostors = game.players.filter(p => !p.isEliminated && p.role === "IMPOSTOR");

                        if (targetPlayer.role === "IMPOSTOR") {
                            game.status = "GAMEOVER";
                            game.winner = null;
                            game.endedAt = new Date(); // Timestamp game end
                        } else {
                            if (remainingImpostors.length >= remainingCivilians.length) {
                                game.status = "GAMEOVER";
                                game.winner = "IMPOSTORS";
                                game.endedAt = new Date(); // Timestamp game end
                            } else {
                                game.players.forEach(p => {
                                    p.submittedWord = "";
                                    p.votedFor = null;
                                    p.hasVoted = false;
                                });
                                game.turnOrder = shuffleArray(game.players.filter(p => !p.isEliminated).map(p => p.id));
                                game.currentTurnIndex = 0;
                                game.status = "PLAYING";
                            }
                        }
                    }
                }
            }
        }

        // --- RESET_LOBBY ---
        else if (action === "RESET_LOBBY") {
            if (!player?.isHost) {
                return NextResponse.json({ message: "Nem te vagy a host" }, { status: 403 });
            }
            game.status = "LOBBY";
            game.winner = null;
            game.category = "";
            game.secretWord = "";
            game.hint = "";
            game.currentTurnIndex = 0;
            game.turnOrder = [];
            game.players.forEach(p => {
                p.role = "CIVIL";
                p.isEliminated = false;
                p.submittedWord = "";
                p.votedFor = null;
                p.hasVoted = false;
                p.isReady = false; // Reset ready states
            });
        }

        // --- LEAVE_ROOM ---
        else if (action === "LEAVE_ROOM") {
            game.players = game.players.filter(p => p.id !== playerId);

            if (game.players.length === 0) {
                await Game.deleteOne({ roomCode });
                return NextResponse.json({ message: "Szoba bezárva" });
            }

            const activeHostExists = game.players.some(p => p.isHost);
            if (!activeHostExists) {
                game.players[0].isHost = true;
            }
        }

        else if (action === "TOGGLE_READY") {
            if (player) {
                player.isReady = !player.isReady;
            }

            // Fetch players who are not eliminated
            const activePlayers = game.players.filter(p => !p.isEliminated);
            const allPlayersReady = activePlayers.every(p => p.isReady);

            // If everyone is ready, transition automatically to the turn-based phase
            if (allPlayersReady) {
                game.status = "PLAYING";
            }
        }

        await game.save();
        return NextResponse.json({ game }, { status: 200 });
    } catch (error) {
        console.error("Hiba az akció során:", error);
        return NextResponse.json({ message: "Szerverhiba" }, { status: 500 });
    }
}