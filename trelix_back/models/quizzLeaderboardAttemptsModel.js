const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const QuizLeaderboardAttemptSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    dateAttempted: { type: Date, default: Date.now },
    score: { type: Number },
    completed: { type: Boolean, default: false },
    passed: { type: Boolean, default: false },
  });
module.exports = mongoose.model("QuizLeaderboardAttempt", QuizLeaderboardAttemptSchema);