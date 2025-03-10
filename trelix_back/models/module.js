const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Module = new Schema({
                      name: { type: String, required: true },
                      description: { type: String, required: true },  
                      StartDate: { type: Date, required: true },                      
})

module.exports = mongoose.model('Module', Module);