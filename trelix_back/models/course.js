const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { generateSlug, ensureUniqueSlug } = require('../utils/slugGenerator');

const Course = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: String,
  price: Number,
  level: String,
  categorie: String,
  module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});



Course.pre('save', async function (next) {
  try {
    this.updatedAt = Date.now();

    if (this.isNew || this.isModified('title')) {
      const baseSlug = generateSlug(this.title);

      this.slug = await ensureUniqueSlug(baseSlug, async (testSlug) => {
        const existingDoc = await mongoose.model('Course').findOne({ slug: testSlug });
        return !!existingDoc;
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model('Course', Course);