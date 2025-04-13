const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ExamAttemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    answers: {
      type: Array,
      required: true,
    },
    results: {
      type: Object,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only attempt an exam once
ExamAttemptSchema.index({ userId: 1, examId: 1 }, { unique: true })

module.exports = mongoose.model("ExamAttempt", ExamAttemptSchema)
