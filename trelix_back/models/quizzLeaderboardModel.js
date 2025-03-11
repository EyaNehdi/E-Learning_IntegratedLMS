const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const quizLeaderboardSchema = new Schema({
    date: String , // YYYY-MM-DD format
    title: {type : String,unique: true},
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

module.exports = mongoose.model("QuizLeaderboard", quizLeaderboardSchema);
