import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Game } from "@/models/Game";

// Generates a random 6-character uppercase alphanumeric room code
function generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { playerId, name } = await request.json();

        if (!playerId || !name) {
            return NextResponse.json({ message: "Hiányzó azonosító vagy név!" }, { status: 400 });
        }

        let roomCode = generateRoomCode();

        // Ensure room code uniqueness inside active DB games
        let existingGame = await Game.findOne({ roomCode });
        while (existingGame) {
            roomCode = generateRoomCode();
            existingGame = await Game.findOne({ roomCode });
        }

        const newGame = new Game({
            roomCode,
            status: "LOBBY",
            players: [
                {
                    id: playerId,
                    name,
                    isHost: true,
                    role: "CIVIL",
                    isEliminated: false,
                    submittedWord: "",
                    votedFor: null,
                    hasVoted: false,
                }
            ],
            category: "",
            secretWord: "",
            hint: "",
            currentTurnIndex: 0,
            turnOrder: [],
            winner: null,
        });

        await newGame.save();

        return NextResponse.json({ roomCode }, { status: 201 });
    } catch (error) {
        console.error("Hiba a szoba létrehozásakor:", error);
        return NextResponse.json({ message: "Szerveroldali hiba történt!" }, { status: 500 });
    }
}