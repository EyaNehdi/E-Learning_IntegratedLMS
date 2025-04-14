const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware'); // Assurez-vous que le chemin est correct
const classroomController = require('../controllers/classroomController'); // Assurez-vous que ce fichier existe

// Vérifiez que les fonctions du contrôleur existent et sont correctement exportées
router.get('/courses', isAuthenticated, classroomController.getCourses);
router.get('/courses/:courseId', isAuthenticated, classroomController.getCourseDetails);

module.exports = router;