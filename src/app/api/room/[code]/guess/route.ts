import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Game } from "@/models/Game";
export const dynamic = "force-static"
interface RouteParams {
    params: Promise<{ code: string }> | { code: string };
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const roomCode = resolvedParams.code.toUpperCase();

        const { playerId, guess } = await request.json();

        const game = await Game.findOne({ roomCode });
        if (!game) {
            return NextResponse.json({ message: "A szoba nem található" }, { status: 404 });
        }

        const player = game.players.find(p => p.id === playerId);
        if (!player || player.role !== "IMPOSTOR") {
            return NextResponse.json({ message: "Csak az Imposztor tippelhet!" }, { status: 403 });
        }

        if (game.status !== "GAMEOVER" || game.winner !== null) {
            return NextResponse.json({ message: "A tippelési fázis már lezárult" }, { status: 400 });
        }

        // Compare values (case-insensitive and whitespace trimmed)
        const normalizedGuess = guess.trim().toLowerCase();
        const normalizedSecret = game.secretWord.trim().toLowerCase();

        if (normalizedGuess === normalizedSecret) {
            game.winner = "IMPOSTORS";
        } else {
            game.winner = "CIVILIANS";
        }
        game.endedAt = new Date(); // Stamp game end on guess evaluation
        await game.save();

        return NextResponse.json({ game }, { status: 200 });
    } catch (error) {
        console.error("Hiba a tipp kiértékelésekor:", error);
        return NextResponse.json({ message: "Szerveroldali hiba történt" }, { status: 500 });
    }
}