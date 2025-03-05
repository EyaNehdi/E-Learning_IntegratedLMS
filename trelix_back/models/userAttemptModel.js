import mongoose from "mongoose";

const userAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    score: Number,
    completedAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserAttempt", userAttemptSchema);
