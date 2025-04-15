const Preference = require("../models/Preference")
const Module = require("../models/module")

const createpreference = async (req, res) => {
  const { typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, moduleId, userId } = req.body

  try {
    console.log("Données reçues:", req.body) // Vérifier les données reçues
    console.log("Module ID:", moduleId) // Vérifier l'ID du module
    console.log("User ID:", userId) // Vérifier l'ID de l'utilisateur

    if (
      !typeRessource ||
      !momentEtude ||
      !langue ||
      !styleContenu ||
      !objectif ||
      !methodeEtude ||
      !moduleId ||
      !userId
    ) {
      return res.status(400).json({ message: "Tous les champs sont requis." })
    }

    // Vérifier si le module existe
    const moduleExists = await Module.findById(moduleId)
    console.log("Module trouvé:", moduleExists) // Vérifier si le module existe
    if (!moduleExists) {
      return res.status(404).json({ message: "Module non trouvé." })
    }

    // Correction: Utiliser le modèle Preference avec un P majuscule
    const newPreference = await Preference.create({
      typeRessource,
      momentEtude,
      langue,
      styleContenu,
      objectif,
      methodeEtude,
      module: moduleId,
      user: userId,
    })

    res.status(201).json(newPreference)
  } catch (error) {
    console.error("Erreur lors de la création de la préférence:", error)
    res.status(500).json({ message: "Erreur du serveur" })
  }
}
const getAllPreference = async (req, res) => {
  try {
    const preferences = await Preference.find().populate("module"); // Pour récupérer aussi les infos du module
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

module.exports = { createpreference,getAllPreference }
