import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { WordPool } from "@/models/WordPool";
import { wordList } from "@/lib/wordPool"

export async function GET() {
    try {
        await dbConnect();

        const count = await WordPool.countDocuments();
        if (count > 0) {
            return NextResponse.json({
                message: "A WordPool már tartalmaz adatokat.",
                count
            });
        }

        // Set of starting words matching category items in your visual mockups
        const initialWords = wordList;

        await WordPool.insertMany(initialWords);

        return NextResponse.json({
            message: "WordPool feltöltve sikeresen!",
            inserted: initialWords.length
        });
    } catch (error) {
        console.error("Hiba a feltöltés során:", error);
        return NextResponse.json({ message: "Szerverhiba" }, { status: 500 });
    }
}