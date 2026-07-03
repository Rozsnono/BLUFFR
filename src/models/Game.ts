import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayer {
    id: string; // Client-generated unique identifier (UUID/Fingerprint)
    name: string;
    isHost: boolean;
    role: "CIVIL" | "IMPOSTOR" | "ELIMINATED";
    isEliminated: boolean;
    submittedWord: string; // The clue word submitted in the current round
    votedFor: string | null; // ID of the player this user voted for
    hasVoted: boolean;
    isReady: boolean; // Added
}

export interface IGame extends Document {
    roomCode: string;
    status: "LOBBY" | "REVEAL" | "PLAYING" | "VOTING" | "GAMEOVER";
    players: IPlayer[];
    category: string;
    secretWord: string;
    hint: string;
    currentTurnIndex: number;
    turnOrder: string[];
    winner: "CIVILIANS" | "IMPOSTORS" | null;
    startedAt?: Date; // Added
    endedAt?: Date;   // Added
    createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    role: { type: String, enum: ["CIVIL", "IMPOSTOR", "ELIMINATED"], default: "CIVIL" },
    isEliminated: { type: Boolean, default: false },
    submittedWord: { type: String, default: "" },
    votedFor: { type: String, default: null },
    hasVoted: { type: Boolean, default: false },
    isReady: { type: Boolean, default: false } // Added
});

const GameSchema = new Schema<IGame>({
    roomCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    status: {
        type: String,
        enum: ["LOBBY", "REVEAL", "PLAYING", "VOTING", "GAMEOVER"],
        default: "LOBBY"
    },
    players: [PlayerSchema],
    category: { type: String, default: "" },
    secretWord: { type: String, default: "" },
    hint: { type: String, default: "" },
    currentTurnIndex: { type: Number, default: 0 },
    turnOrder: [{ type: String }],
    winner: { type: String, enum: ["CIVILIANS", "IMPOSTORS", null], default: null },
    startedAt: { type: Date },
    endedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, expires: 86400 }
});

export const Game: Model<IGame> = mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);