const mongoose = require('mongoose');

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

// Define the Quiz model schema
const QuizSchema = new mongoose.Schema({
  quizName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: [QuestionSchema],
    required: true,
  },
}, { timestamps: true });

// Create and export the Quiz model
const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;
