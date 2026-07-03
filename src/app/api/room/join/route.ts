import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Game } from "@/models/Game";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { roomCode, playerId, name } = await request.json();

    if (!roomCode || !playerId || !name) {
      return NextResponse.json({ message: "Hiányzó adatok a csatlakozáshoz!" }, { status: 400 });
    }

    const uppercaseCode = roomCode.toUpperCase();
    const game = await Game.findOne({ roomCode: uppercaseCode });

    if (!game) {
      return NextResponse.json({ message: "A szoba nem található!" }, { status: 404 });
    }

    if (game.status !== "LOBBY") {
      return NextResponse.json({ message: "A játék már folyamatban van!" }, { status: 400 });
    }

    if (game.players.length >= 99) {
      return NextResponse.json({ message: "A szoba megtelt!" }, { status: 400 });
    }

    // Check if the player is already registered in the array
    const existingPlayerIndex = game.players.findIndex(p => p.id === playerId);
    
    if (existingPlayerIndex > -1) {
      // If they are already in, update their name (supports reconnect/tab refreshing)
      game.players[existingPlayerIndex].name = name;
    } else {
      // Otherwise, add them as a new participant
      game.players.push({
        id: playerId,
        name,
        isHost: false,
        role: "CIVIL",
        isEliminated: false,
        submittedWord: "",
        votedFor: null,
        hasVoted: false,
      });
    }

    await game.save();

    return NextResponse.json({ message: "Sikeres csatlakozás!", game }, { status: 200 });
  } catch (error) {
    console.error("Hiba a csatlakozáskor:", error);
    return NextResponse.json({ message: "Szerveroldali hiba történt!" }, { status: 500 });
  }
}