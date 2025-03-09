const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Module = new Schema({
                      name: { type: String, required: true }
})

module.exports = mongoose.model('Module', Module);