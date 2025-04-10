const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Certificate = new Schema({
    name: String,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    description: String,
    category: String,
    provider: String,
    providerLogo: { type: String, default: null },
    certificateFile: { type: String, default: null },
    external: Boolean,
});

module.exports = mongoose.model('Certificate', Certificate);