const express = require('express');
const router = express.Router();
const { registerStudent, registerInstructor } = require('../controllers/authController');


router.post('/register/student', registerStudent);

router.post('/register/instructor', registerInstructor);

module.exports = router;