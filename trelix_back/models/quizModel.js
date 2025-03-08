const mongoose = require('mongoose');

// Define the schema for options (for questions that have multiple options like radio or label)
const OptionSchema = new mongoose.Schema({
  option: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

// Define the schema for each question
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  // For text questions, answer is a string
  answer: {
    type: String,  // For text questions, the answer is a string
    required: true,  // Always required for text questions
  },
  // For radio or label questions, options is an array of Option objects
  options: {
    type: [OptionSchema],
    required: function() { return this.type === 'radio' || this.type === 'label'; }, // Only required for radio or label questions
  },
  // Define the type of the question (text, radio, label)
  type: {
    type: String,
    enum: ['text', 'radio', 'label'], // Only these types are allowed
    required: true,
  },
});

// Define the Quiz model schema
const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  questions: {
    type: [QuestionSchema],
    required: true,  // The quiz must contain questions
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Quiz model
const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;
