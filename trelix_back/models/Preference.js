const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Correction: Renommer la variable de schéma pour éviter la confusion
const PreferenceSchema = new Schema({
  typeRessource: String,
  momentEtude: String,
  langue: String,
  styleContenu: String,
  objectif: String,
  methodeEtude: String,
  module: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
})

// Correction: Exporter le modèle avec le bon nom
module.exports = mongoose.model("Preference", PreferenceSchema)
