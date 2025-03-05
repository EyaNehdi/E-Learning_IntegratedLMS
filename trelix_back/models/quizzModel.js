const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
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

export default mongoose.model("Quiz", quizSchema);
