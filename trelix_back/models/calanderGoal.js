// models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  color: {
    type: String,
    default: '#0f6cbf'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Goal', goalSchema);
