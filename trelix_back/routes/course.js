var express = require('express');
var router = express.Router();
const { 
    createCourse, 
    getAllCourses, 
    getCourseById, 
    updateCourse, 
    deleteCourse,
    searchCourses  // Ajout de la fonction de recherche
} = require('../controllers/courseController');

// Routes pour les cours
router.post("/addcourse", createCourse);
router.get("/courses", getAllCourses);
router.get("/search", searchCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);

module.exports = router;
