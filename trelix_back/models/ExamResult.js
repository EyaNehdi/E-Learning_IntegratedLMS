// models/ExamResult.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create ExamResult Schema
const ExamResultSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',  // Reference to the User model
        required: true
    },
    exam: { 
        type: Schema.Types.ObjectId, 
        ref: 'Exam',  // Reference to the Exam model
        required: true 
    },
    score: { 
        type: Number, 
        required: true 
    },
    answers: { 
        type: [String],  // List of answers (adjust as needed)
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

// Create ExamResult Model
module.exports = mongoose.model('ExamResult', ExamResultSchema);
