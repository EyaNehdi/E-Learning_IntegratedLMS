const express = require('express');
const router = express.Router();
const { registerStudent, registerInstructor, checkAuth, signIn,signOut, registerGoogle, registerInstructorgoogle, registerInstructorgithub, registerStudentgithub, registerStudentgoogle } = require('../controllers/authController');
const { verifyToken } = require ('../middlewares/verifyToken.js');

router.get('/verifyToken', verifyToken,checkAuth);
router.post('/register/student', registerStudent);

router.post('/register/instructor', registerInstructor);
router.post('/register/google', registerInstructorgoogle);
router.post('/register/github', registerInstructorgithub);
router.post('/register/githubStudent', registerStudentgithub);
router.post('/register/googleStudent', registerStudentgoogle);

router.post("/login", signIn);
router.post("/logingoogle", signIn);
router.post("/logout", signOut);

module.exports = router;