const Course = require("../models/course");
const Module = require("../models/module");

// Créer un cours
const createCourse = async (req, res) => {
    const { title, description, price, level, categorie, moduleId, userId } = req.body;

    try {
        if (!title || !description || !price || !level || !categorie || !moduleId || !userId) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        const moduleExists = await Module.findById(moduleId);
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
            user: userId
        });

        res.status(201).json(course);
    } catch (error) {
        console.error("Erreur lors de la création du cours:", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
};

// Récupérer tous les cours
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("module");
        res.status(200).json(courses);
    } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
};

// Récupérer un cours par son ID
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

// Mettre à jour un cours
const updateCourse = async (req, res) => {
    try {
        const { title, description, price, level, categorie } = req.body;

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            { title, description, price, level, categorie },
            { new: true }
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

// Supprimer un cours
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
const likeCourse = async (req, res) => {
    const { courseId } = req.params;  // Récupérer l'ID du cours dans les paramètres de la route

    try {
        // Chercher le cours dans la base de données
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Cours non trouvé" });  // Si le cours n'existe pas
        }

        // Incrémenter le nombre de likes
        course.likes += 1;
        await course.save();  // Sauvegarder le cours mis à jour dans la base de données

        res.status(200).json(course);  // Retourner le cours avec le nombre de likes mis à jour
    } catch (error) {
        console.error("Erreur lors de l'ajout du like:", error);
        res.status(500).json({ message: "Erreur du serveur" });  // Gérer les erreurs serveur
    }
};

// Rechercher des cours par titre ou description
const searchCourses = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Veuillez fournir un terme de recherche." });
        }

        const courses = await Course.find({
            $or: [
                { title: { $regex: query, $options: "i" } }, // Recherche insensible à la casse
                { description: { $regex: query, $options: "i" } }
            ]
        });

        res.status(200).json(courses);
    } catch (error) {
        console.error("Erreur lors de la recherche des cours:", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }


};
    // Récupérer les catégories avec le nombre de cours dans chaque
    const getCoursesByCategory = async (req, res) => {
        try {
          const categories = await Course.aggregate([
            {
              $group: {
                _id: "$categorie",
                totalCourses: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                categorie: "$_id",
                totalCourses: 1
              }
            }
          ]);
      
          res.status(200).json(categories);
        } catch (error) {
          console.error("Erreur lors de la récupération des catégories:", error);
          res.status(500).json({ message: "Erreur du serveur" });
        }
      };
      const countCourses = async (req, res) => {
        try {
            const count = await Course.countDocuments();
            res.status(200).json({ count });
        } catch (error) {
            console.error("Erreur lors du comptage des cours:", error);
            res.status(500).json({ message: "Erreur du serveur" });
        }
    };
module.exports = { createCourse,
     getAllCourses,
      getCourseById,
       updateCourse,
        deleteCourse,
         searchCourses,
         getCoursesByCategory,likeCourse,
        countCourses };

