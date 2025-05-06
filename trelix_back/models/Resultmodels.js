const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: { type: Object, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", ResultSchema);
