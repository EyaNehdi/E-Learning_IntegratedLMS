const express = require('express');
const router = express.Router();
const { registerStudent, registerInstructor, checkAuth, signIn,signOut,verifyEmail,forgotPassword,resetPassword,registerInstructorgoogle,registerInstructorgithub,registerStudentgithub,registerStudentgoogle, signIngoogle, signIngithub } = require('../controllers/authController');
const { verifyToken } = require ('../middlewares/verifyToken.js');

router.get('/check-auth', verifyToken, checkAuth);
router.post('/register/student', registerStudent);

router.post('/register/instructor', registerInstructor);
router.post('/register/google', registerInstructorgoogle);
router.post('/register/github', registerInstructorgithub);
router.post('/register/githubStudent', registerStudentgithub);
router.post('/register/googleStudent', registerStudentgoogle);

router.post("/login", signIn);
router.post("/logingoogle", signIngoogle);
router.post("/loginGit", signIngithub);
router.post("/logout", signOut);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword );
router.post("/reset-password/:token", resetPassword);

module.exports = router;