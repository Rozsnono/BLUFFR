import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWordPool extends Document {
    category: string;
    secretWord: string;
    hint: string;
}

const WordPoolSchema = new Schema<IWordPool>({
    category: { type: String, required: true, index: true },
    secretWord: { type: String, required: true },
    hint: { type: String, required: true },
});

export const WordPool: Model<IWordPool> =
    mongoose.models.WordPool || mongoose.model<IWordPool>("WordPool", WordPoolSchema);