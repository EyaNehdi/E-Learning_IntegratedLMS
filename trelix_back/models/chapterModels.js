const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid'); 
const ChapterSchema = new Schema({
 id: { type: String, required: true, unique: true, default: uuidv4 }, 
  title: { type: String, required: true },
  description: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdf: { type: String }, 
  video: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


ChapterSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});



module.exports = mongoose.model('Chapter', ChapterSchema);
