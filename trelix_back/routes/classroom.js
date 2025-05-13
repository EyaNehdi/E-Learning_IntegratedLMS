// routes/classroom.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/auth.middleware');
const classroomController = require('../controllers/classroomController');

router.get('/courses', isAuthenticated, classroomController.getCourses);
router.get('/courses/:courseId', isAuthenticated, classroomController.getCourseDetails);

module.exports = router;