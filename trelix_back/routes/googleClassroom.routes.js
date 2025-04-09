const express = require('express');
const router = express.Router();
const googleClassroomController = require('../controllers/googleClassroom.controller');

// Ajoutez des logs pour déboguer
router.get('/auth/url', (req, res) => {
  console.log('Route /auth/url appelée');
  googleClassroomController.getGoogleAuthUrl(req, res);
});

router.get('/auth/callback', (req, res) => {
  console.log('Route /auth/callback appelée avec code:', req.query.code ? 'Présent' : 'Absent');
  googleClassroomController.handleGoogleCallback(req, res);
});

router.get('/courses', (req, res) => {
  console.log('Route /courses appelée');
  googleClassroomController.getAllCourses(req, res);
  
});

module.exports = router;