const Module = require("../models/module");


const getModules = async (req, res) => {
    try {
      const modules = await Module.find(); // Trouver tous les modules dans la base de données
      res.status(200).json(modules); // Retourner les modules sous forme de JSON
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des modules" });
    }
  };

const createModule = async (req, res) => {
    const { name,description,StartDate } = req.body;

    try {
        console.log("Données reçues:", req.body); 

        if (!name || !description || !StartDate) {
            return res.status(400).json({ message: "Le champ name est requis." });
        }

        const module = await Module.create({ name , description,StartDate }); // Créer un nouveau module dans la base de données
        res.status(201).json(module);
    } catch (error) {
        console.error("Erreur lors de la création du module:", error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
};

module.exports = { getModules,createModule };
