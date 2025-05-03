const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
const { generateSlug, ensureUniqueSlug } = require('../utils/slugGenerator');

const ChapterSchema = new Schema({
  id: { type: String, required: true, unique: true, default: uuidv4 },
  title: { type: String, required: true },
  slug: {
    type: String,
    index: true
  },
  description: { type: String },
  courseId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdf: { type: String },
  video: { type: String },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChapterSchema.index({ 'courseId': 1, 'slug': 1 }, { unique: true });

ChapterSchema.pre('save', async function (next) {
  try {
    this.updatedAt = Date.now();
    if (this.isNew || this.isModified('title')) {
      const baseSlug = generateSlug(this.title);

      const courseId = Array.isArray(this.courseId) ? this.courseId[0] : this.courseId;

      this.slug = await ensureUniqueSlug(baseSlug, async (testSlug) => {
        const existingDoc = await mongoose.model('Chapter').findOne({
          courseId: courseId,
          slug: testSlug
        });
        return !!existingDoc;
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Chapter', ChapterSchema);