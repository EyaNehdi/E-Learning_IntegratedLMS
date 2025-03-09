const Course = require("../models/course");
const Module = require("../models/module");

const createCourse = async (req, res) => {
  const { title, description, price, level, categorie, moduleId ,userId} = req.body;

  try {
    console.log("Données reçues:", req.body); // Vérifier les données reçues
    console.log("Module ID:", moduleId); // Vérifier l'ID du module

    if (!title || !description || !price || !level || !categorie || !moduleId || !userId) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si le module existe
    const moduleExists = await Module.findById(moduleId);
    console.log("Module trouvé:", moduleExists); // Vérifier si le module existe
    if (!moduleExists) {
      return res.status(404).json({ message: "Module non trouvé." });
    }

    const course = await Course.create({
      title,
      description,
      price,
      level,
      categorie,
      module: moduleId,
      user:userId
    });
    res.status(201).json(course);
  } catch (error) {
    console.error("Erreur lors de la création du cours:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("module"); // Pour récupérer aussi les infos du module
    res.status(200).json(courses);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};
const getCourseById = async (req, res) => {
                      try {
                        const course = await Course.findById(req.params.id);
                        if (!course) {
                          return res.status(404).json({ message: "Cours non trouvé" });
                        }
                        res.status(200).json(course);
                      } catch (error) {
                        console.error("Erreur lors de la récupération du cours :", error);
                        res.status(500).json({ message: "Erreur du serveur" });
                      }
                    };
                    
                    // Modifier un cours
                    const updateCourse = async (req, res) => {
                      try {
                        const { title, description, price, level, categorie } = req.body;
                    
                        const updatedCourse = await Course.findByIdAndUpdate(
                          req.params.id,
                          { title, description, price, level, categorie },
                          { new: true } // Retourner le document mis à jour
                        );
                    
                        if (!updatedCourse) {
                          return res.status(404).json({ message: "Cours non trouvé" });
                        }
                    
                        res.status(200).json(updatedCourse);
                      } catch (error) {
                        console.error("Erreur lors de la mise à jour du cours :", error);
                        res.status(500).json({ message: "Erreur du serveur" });
                      }
                    };
                    const deleteCourse = async (req, res) => {
                      try {
                        const course = await Course.findByIdAndDelete(req.params.id);
                        
                        if (!course) {
                          return res.status(404).json({ message: "Cours non trouvé" });
                        }
                    
                        res.status(200).json({ message: "Cours supprimé avec succès" });
                      } catch (error) {
                        console.error("Erreur lors de la suppression du cours :", error);
                        res.status(500).json({ message: "Erreur du serveur" });
                      }
                    };
module.exports = { createCourse , getAllCourses ,getCourseById, updateCourse,deleteCourse};
