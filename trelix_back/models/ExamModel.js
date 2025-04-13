const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'], required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: false },
    points: { type: Number, required: true }
});

const ExamSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    passingScore: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
    totalPoints: { type: Number, required: true },
    questions: { type: [QuestionSchema], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalFile: {
        name: { type: String },
        path: { type: String },
        size: { type: Number },
        type: { type: String },
        url: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
