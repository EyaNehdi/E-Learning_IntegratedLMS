const Preference = require("../models/Preference");
const Module = require("../models/module");
const Course = require("../models/course");
const User = require("../models/userModel");

const createpreference = async (req, res) => {
  const { typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, module, user } = req.body;

  try {
    console.log("Received preference data:", req.body);

    if (
      !typeRessource ||
      !momentEtude ||
      !langue ||
      !styleContenu ||
      !objectif ||
      !methodeEtude ||
      !module ||
      !user
    ) {
      console.log("Missing fields in request:", req.body);
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const moduleExists = await Module.findById(module);
    console.log("Module found:", moduleExists);
    if (!moduleExists) {
      console.log("Module not found for ID:", module);
      return res.status(404).json({ message: "Module non trouvé." });
    }

    const userExists = await User.findById(user);
    console.log("User found:", userExists);
    if (!userExists) {
      console.log("User not found for ID:", user);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const newPreference = await Preference.create({
      typeRessource,
      momentEtude,
      langue,
      styleContenu,
      objectif,
      methodeEtude,
      module,
      user,
    });

    console.log("Preference created:", newPreference);

    res.status(201).json({
      preference: newPreference,
      moduleId: module,
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ message: "Erreur du serveur", error: error.message });
  }
};

const updatePreference = async (req, res) => {
  const { id } = req.params;
  const { typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, module, user } = req.body;

  try {
    console.log("Received update data for ID:", id, "Data:", req.body);

    if (
      !typeRessource ||
      !momentEtude ||
      !langue ||
      !styleContenu ||
      !objectif ||
      !methodeEtude ||
      !module ||
      !user
    ) {
      console.log("Missing fields in update request:", req.body);
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      console.log("Module not found for ID:", module);
      return res.status(404).json({ message: "Module non trouvé." });
    }

    const userExists = await User.findById(user);
    if (!userExists) {
      console.log("User not found for ID:", user);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const updatedPreference = await Preference.findByIdAndUpdate(
      id,
      {
        typeRessource,
        momentEtude,
        langue,
        styleContenu,
        objectif,
        methodeEtude,
        module,
        user,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPreference) {
      console.log("Preference not found for ID:", id);
      return res.status(404).json({ message: "Préférence non trouvée pour l'ID spécifié." });
    }

    console.log("Preference updated:", updatedPreference);

    res.status(200).json({
      preference: updatedPreference,
      moduleId: module,
    });
  } catch (error) {
    console.error("Error updating preference:", error);
    res.status(500).json({ message: "Erreur du serveur", error: error.message });
  }
};

const getAllPreference = async (req, res) => {
  try {
    const { user } = req.query;
    if (!user) {
      console.log("Missing user in query parameters");
      return res.status(400).json({ message: "L'identifiant de l'utilisateur est requis." });
    }
    const preferences = await Preference.find({ user }).populate("module user");
    console.log("Preferences retrieved for user", user, ":", preferences);
    res.status(200).json(preferences);
  } catch (error) {
    console.error("Error retrieving preferences:", error);
    res.status(500).json({ message: "Erreur du serveur", error: error.message });
  }
};

const getRecommendedCourses = async (req, res) => {
  const { module, user } = req.query;

  try {
    if (!module || !user) {
      console.log("Missing query parameters:", { module, user });
      return res.status(400).json({ message: "Les identifiants du module et de l'utilisateur sont requis." });
    }

    const moduleExists = await Module.findById(module);
    console.log("Module found for courses:", moduleExists);
    if (!moduleExists) {
      console.log("Module not found for ID:", module);
      return res.status(404).json({ message: "Module non trouvé." });
    }

    const userExists = await User.findById(user);
    console.log("User found:", userExists);
    if (!userExists) {
      console.log("User not found for ID:", user);
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const courses = await Course.find({ module }).populate("module user");
    console.log("Courses found:", courses);

    if (!courses || courses.length === 0) {
      console.log("No courses found for module:", module);
      return res.status(404).json({ message: "Aucun cours trouvé pour ce module." });
    }

    const recommendedCourses = courses.map((course) => ({
      id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      categorie: course.categorie,
      moduleName: moduleExists.name,
      courseSlug: course.slug,
    }));

    console.log("Recommended courses:", recommendedCourses);
    res.status(200).json(recommendedCourses);
  } catch (error) {
    console.error("Error retrieving recommended courses:", error);
    res.status(500).json({ message: "Erreur du serveur", error: error.message });
  }
};


module.exports = { createpreference, updatePreference, getAllPreference, getRecommendedCourses };

