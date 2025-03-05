const mongoose = require('mongoose');

const quizLeaderboardSchema = new mongoose.Schema({
    date: { type: String, unique: true }, // YYYY-MM-DD format
    questions: [
        {
            question: String,
            options: [String],
            correctAnswer: String,
            timeLimit: Number, // Time limit per question in seconds
        },
    ],
    isActive: { type: Boolean, default: false },
});

export default mongoose.model("QuizLeaderboard", quizLeaderboardSchema);
