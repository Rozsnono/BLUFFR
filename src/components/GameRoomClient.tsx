"use client";

import React, { useState, useEffect } from "react";
import LobbyScreen from "@/components/LobbyScreen";
import RoleRevealScreen from "@/components/RoleRevealScreen";
import PlayTurnScreen from "@/components/PlayTurnScreen";
import VotingScreen from "@/components/VotingScreen";
import GameOverScreen from "@/components/GameOverScreen";

interface Player {
    id: string;
    name: string;
    isHost: boolean;
    role: "CIVIL" | "IMPOSTOR" | "ELIMINATED";
    isEliminated: boolean;
    submittedWord: string;
    votedFor: string | null;
    hasVoted: boolean;
}

interface GameState {
    roomCode: string;
    status: "LOBBY" | "REVEAL" | "PLAYING" | "VOTING" | "GAMEOVER";
    players: Player[];
    category: string;
    secretWord: string;
    hint: string;
    currentTurnIndex: number;
    turnOrder: string[];
    winner: "CIVILIANS" | "IMPOSTORS" | null;
    startedAt: string | null;
    endedAt: string | null;
}

interface GameRoomClientProps {
    roomCode: string;
}

export default function GameRoomClient({ roomCode }: GameRoomClientProps) {
    const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
    const [currentPlayerName, setCurrentPlayerName] = useState<string>("");
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState<boolean>(false);

    // Initialize client credentials from localStorage
    useEffect(() => {
        let savedId = localStorage.getItem("impostor_player_id");
        let savedName = localStorage.getItem("impostor_player_name") || "";
        if (!savedId) {
            savedId = crypto.randomUUID();
            localStorage.setItem("impostor_player_id", savedId);
        }
        setCurrentPlayerId(savedId);
        setCurrentPlayerName(savedName);
    }, []);

    // 1-second short-polling state loop
    useEffect(() => {
        if (!currentPlayerId) return;

        const fetchGameState = async () => {
            try {
                const response = await fetch(`/api/room/${roomCode}?playerId=${currentPlayerId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("A szoba nem található.");
                    }
                    return;
                }
                const data = await response.json();
                setGameState(data.game);
                setLoading(false);
            } catch (err) {
                console.error("Hiba az állás lekérésekor:", err);
            }
        };

        fetchGameState();
        const interval = setInterval(fetchGameState, 1000);
        return () => clearInterval(interval);
    }, [roomCode, currentPlayerId]);

    // Join handler for users not yet registered in this lobby
    const handleJoinLobby = async () => {
        if (!currentPlayerName.trim() || isJoining) return;
        setIsJoining(true);
        try {
            localStorage.setItem("impostor_player_name", currentPlayerName.trim());
            const response = await fetch(`/api/room/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomCode,
                    playerId: currentPlayerId,
                    name: currentPlayerName.trim()
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                setError(errData.message || "Sikertelen csatlakozás.");
            }
        } catch (err) {
            console.error(err);
            setError("Hálózati hiba a csatlakozáskor.");
        } finally {
            setIsJoining(false);
        }
    };

    // State mutations dispatched to the dynamic action endpoint
    const sendGameAction = async (payload: object) => {
        try {
            await fetch(`/api/room/${roomCode}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, playerId: currentPlayerId }),
            });
        } catch (err) {
            console.error("Hiba az akció küldésekor:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
                <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-950 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-medium">Kapcsolódás a szobához...</p>
            </div>
        );
    }

    if (error || !gameState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
                <h2 className="text-2xl font-bold text-rose-500 mb-4">Hiba történt</h2>
                <p className="text-slate-300 mb-6">{error || "Sikertelen kapcsolódás"}</p>
                <button
                    onClick={() => window.location.href = "/"}
                    className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 transition"
                >
                    Vissza a főmenübe
                </button>
            </div>
        );
    }

    const me = gameState.players.find((p) => p.id === currentPlayerId);

    // If local credentials exist but this user is not inside the DB record for this room
    if (!me) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
                <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    <h2 className="text-xl font-bold text-center mb-2">Csatlakozás a szobához</h2>
                    <p className="text-xs text-slate-400 text-center mb-6">Szobakód: <span className="text-indigo-400 font-bold">{roomCode}</span></p>
                    <input
                        type="text"
                        placeholder="Írd be a beceneved..."
                        value={currentPlayerName}
                        onChange={(e) => setCurrentPlayerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 mb-4 text-center focus:outline-none focus:border-indigo-500 text-white font-bold"
                    />
                    <button
                        onClick={handleJoinLobby}
                        disabled={!currentPlayerName.trim() || isJoining}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 disabled:opacity-50 rounded-2xl font-bold shadow-lg shadow-indigo-500/10 transition duration-200"
                    >
                        {isJoining ? "Belépés..." : "Belépés"}
                    </button>
                </div>
            </div>
        );
    }

    const isHost = me.isHost;

    // --- RENDERING ROUTE ENGINE ---

    if (gameState.status === "LOBBY") {
        return (
            <LobbyScreen
                roomCode={gameState.roomCode}
                players={gameState.players}
                currentPlayerId={currentPlayerId}
                isHost={isHost}
                onStartGame={() => sendGameAction({ action: "START_GAME" })}
                onLeaveRoom={() => {
                    sendGameAction({ action: "LEAVE_ROOM" });
                    window.location.href = "/";
                }}
            />
        );
    }

    if (gameState.status === "REVEAL") {
        return (
            <RoleRevealScreen
                playerName={me.name}
                role={me.role === "IMPOSTOR" ? "IMPOSTOR" : "CIVIL"}
                wordOrHint={me.role === "IMPOSTOR" ? gameState.hint : gameState.secretWord}
                category={gameState.category}
                players={gameState.players as any} // Pass the dynamic player array
                currentPlayerId={currentPlayerId}
                onToggleReady={() => sendGameAction({ action: "TOGGLE_READY" })} // Direct actions to ready toggle
            />
        );
    }

    if (gameState.status === "PLAYING") {
        return (
            <PlayTurnScreen
                players={gameState.players}
                activePlayerId={gameState.turnOrder[gameState.currentTurnIndex]}
                currentPlayerId={currentPlayerId}
                category={gameState.category}
                secretWord={me.role === "IMPOSTOR" ? null : gameState.secretWord}
                onSubmitWord={(word) => sendGameAction({ action: "SUBMIT_WORD", word })}
            />
        );
    }

    if (gameState.status === "VOTING") {
        return (
            <VotingScreen
                players={gameState.players}
                currentPlayerId={currentPlayerId}
                currentVoteId={me.votedFor}
                hasVoted={me.hasVoted}
                isEliminated={me.isEliminated}
                onVote={(targetId) => sendGameAction({ action: "CAST_VOTE", targetId })}
            />
        );
    }

    if (gameState.status === "GAMEOVER") {
        // 1. Calculate playtime dynamically
        const getDynamicPlaytime = () => {
            if (!gameState.startedAt) return "00:00";
            const start = new Date(gameState.startedAt).getTime();
            const end = gameState.endedAt ? new Date(gameState.endedAt).getTime() : Date.now();
            const totalSeconds = Math.floor((end - start) / 1000);
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
            const seconds = (totalSeconds % 60).toString().padStart(2, "0");
            return `${minutes}:${seconds}`;
        };

        // 2. Calculate civilian efficiency (survivor ratio) dynamically
        const getDynamicEfficiency = () => {
            const civilians = gameState.players.filter(p => p.role === "CIVIL");
            if (civilians.length === 0) return "0%";
            const survivors = civilians.filter(p => !p.isEliminated).length;
            const percentage = Math.round((survivors / civilians.length) * 100);
            return `${percentage}%`;
        };

        // 3. Populate dynamic round history entries matching your mockup styling
        const mappedRounds = [
            {
                id: 1,
                word: gameState.secretWord,
                category: gameState.category,
                duration: getDynamicPlaytime(),
                players: gameState.players.filter(p => p.role === "IMPOSTOR").map(p => p.name)
            }
        ];

        return (
            <GameOverScreen
                winner={gameState.winner || "CIVILIANS"}
                secretWord={gameState.secretWord}
                playtime={getDynamicPlaytime()}
                efficiency={getDynamicEfficiency()}
                players={gameState.players} // Pass the dynamic players array directly
                rounds={mappedRounds}
                isHost={isHost}
                onRestart={() => sendGameAction({ action: "RESET_LOBBY" })}
                onExit={() => {
                    sendGameAction({ action: "LEAVE_ROOM" });
                    window.location.href = "/";
                }}
            />
        );
    }


    return null;
}