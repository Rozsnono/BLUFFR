import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Game } from "@/models/Game";
export const dynamic = "force-static"
interface RouteParams {
    params: Promise<{ code: string }> | { code: string };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        await dbConnect();

        // Await params to remain compatible across Next.js 14 and 15 versions
        const resolvedParams = await params;
        const roomCode = resolvedParams.code.toUpperCase();

        const game = await Game.findOne({ roomCode });

        if (!game) {
            return NextResponse.json({ message: "A szoba nem található!" }, { status: 404 });
        }

        return NextResponse.json({ game }, { status: 200 });
    } catch (error) {
        console.error("Hiba a lekérdezés során:", error);
        return NextResponse.json({ message: "Szerveroldali hiba történt!" }, { status: 500 });
    }
}