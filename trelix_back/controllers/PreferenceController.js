const Preference = require("../models/Preference");
const Module = require("../models/module");
const Course = require("../models/course");

const createpreference = async (req, res) => {
  const { typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, moduleId, userId } = req.body;

  try {
    console.log("Données reçues:", req.body);
    console.log("Module ID:", moduleId);
    console.log("User ID:", userId);

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
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si le module existe
    const moduleExists = await Module.findById(moduleId);
    console.log("Module trouvé:", moduleExists);
    if (!moduleExists) {
      return res.status(404).json({ message: "Module non trouvé." });
    }

    const newPreference = await Preference.create({
      typeRessource,
      momentEtude,
      langue,
      styleContenu,
      objectif,
      methodeEtude,
      module: moduleId,
      user: userId,
    });

    // Retourner la préférence et l'ID du module pour la redirection
    res.status(201).json({
      preference: newPreference,
      moduleId: moduleId,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la préférence:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

const getAllPreference = async (req, res) => {
  try {
    const preferences = await Preference.find().populate("module");
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Erreur lors de la récupération des préférences:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

const getRecommendedCourses = async (req, res) => {
  const { moduleId, userId } = req.query;

  try {
    if (!moduleId || !userId) {
      return res.status(400).json({ message: "moduleId et userId sont requis." });
    }

    // Vérifier si le module existe
    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({ message: "Module non trouvé." });
    }

    // Récupérer les cours associés au module
    const courses = await Course.find({ module: moduleId }).populate("module user");

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "Aucun cours trouvé pour ce module." });
    }

    // Logique de recommandation simple
    const recommendedCourses = courses.map((course) => ({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      categorie: course.categorie,
      moduleName: moduleExists.name,
    }));

    res.status(200).json(recommendedCourses);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours recommandés:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

module.exports = { createpreference, getAllPreference, getRecommendedCourses };