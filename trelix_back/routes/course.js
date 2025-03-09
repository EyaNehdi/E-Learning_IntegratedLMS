var express = require('express');
var router = express.Router();
const {createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse} = require('../controllers/courseController');

router.post("/addcourse",createCourse)
router.get("/courses",getAllCourses)
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/delete/:id", deleteCourse);





module.exports = router;
