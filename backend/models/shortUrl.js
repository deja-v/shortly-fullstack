import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        unique: true,
        required: true,
    },
    redirectUrl: {
        type: String,
        required: true,
    },
    visitHistory: [
        {
            timestamp:{
                type: Number
            }
        },
    ],
},{timestamps: true});

export const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);
