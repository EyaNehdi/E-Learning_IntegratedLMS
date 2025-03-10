const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Course = new Schema({
                      title:String,
                      description:String,
                      price:String,
                      level:String,
                      categorie:String,
                      module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
                      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                      chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],


})

module.exports = mongoose.model('Course', Course);