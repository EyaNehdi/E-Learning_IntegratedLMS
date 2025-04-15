var express = require('express');
var router = express.Router();
const { 
    createCourse, 
    getAllCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse,

    likeCourse,

    searchCourses,
    getCoursesByCategory , // Ajout de la fonction de recherche
countCourses
} = require('../controllers/courseController');

// Routes pour les cours
router.post("/addcourse", createCourse);
router.get("/courses", getAllCourses);
router.get("/search", searchCourses);
router.get('/categories', getCoursesByCategory); // Route pour récupérer les catégories avec le nombre de cours
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);
router.post("/like/:courseId", likeCourse);
router.get("/count/courses", countCourses); // Route pour compter le nombre de cours


module.exports = router;
