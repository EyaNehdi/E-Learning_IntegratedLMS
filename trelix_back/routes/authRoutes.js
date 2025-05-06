const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken.js');
const { validateInput } = require('../middlewares/validators.js');
const { checkUserIsActive } = require('../middlewares/UserAccess.js');
const { logActivityMiddleware, identifyActingUser } = require("../middlewares/logActivityMiddleware");

//api Authentication Routes
router.post('/register/google', authController.registerInstructorgoogle);
router.post('/register/github', authController.registerInstructorgithub);
router.post('/register/githubStudent', authController.registerStudentgithub);
router.post('/register/googleStudent', authController.registerStudentgoogle);
router.post('/register/linkedinInstructor', authController.registerInstructorLinkedin);
router.post('/register/linkedinStudent', authController.registerStudentLinkedin);
router.post("/loginLinkedIn", authController.signInlinkedin);
router.post("/logingoogle", checkUserIsActive, authController.signIngoogle);
router.post("/loginGit", authController.signIngithub);

// Authentication Routes
router.post('/register/student', validateInput, identifyActingUser, logActivityMiddleware('register', 'Auth'), authController.registerStudent);
router.post('/register/instructor', validateInput, identifyActingUser, logActivityMiddleware('register', 'Auth'), authController.registerInstructor);
router.post("/verify-email", identifyActingUser, logActivityMiddleware('login', 'Auth'), authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationCode);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// signin checkAuth signout Authentication Routes
router.get('/check-auth', verifyToken, authController.checkAuth);
router.post("/login", checkUserIsActive, identifyActingUser, logActivityMiddleware('login', 'Auth'), authController.signIn);
router.post("/logout", authController.signOut);

//others
router.get('/current-location', verifyToken, authController.trackCurrentLocation);

module.exports = router;