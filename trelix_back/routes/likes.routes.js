const express = require('express');
const router = express.Router();
const { likeCourse } = require('../controllers/courseController');  // Importer le contrôleur qui gère l'ajout du like

// Route pour ajouter un like à un cours
router.post('/course/like/:courseId', likeCourse);

module.exports = router;
