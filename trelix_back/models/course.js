const mongoose = require('mongoose');
const { number } = require('yup');
const Schema = mongoose.Schema;


const Course = new Schema({
                      title:String,
                      description:String,
                      price:Number,
                      level:String,
                      categorie:String,
                      module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
                      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                      chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
                      exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
                      likes: {
                                            type: Number,
                                            default: 0  // Initialement, le nombre de likes est à 0
                                          },


})

module.exports = mongoose.model('Course', Course);