const express = require('express');
const router = express.Router();
const { registerStudent,
     registerInstructor,
     checkAuth,
     signIn, signOut, verifyEmail, forgotPassword, resetPassword, registerInstructorgoogle, registerInstructorgithub, registerStudentgithub, registerStudentgoogle, signIngoogle, signIngithub, registerLinkedIn,
     registerInstructorLinkedin,
     registerStudentLinkedin,
     markChapterAsCompleted,
     signInlinkedin,
     trackCurrentLocation,
     resendVerificationCode } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken.js');
const { validateInput } = require('../middlewares/validators.js');
const { checkUserIsActive } = require('../middlewares/UserAccess.js');

router.get('/check-auth', verifyToken, checkAuth);
router.post('/register/student', validateInput, registerStudent);

router.get('/current-location', verifyToken, trackCurrentLocation);

router.post('/register/instructor', validateInput, registerInstructor);

router.post('/register/google', registerInstructorgoogle);
router.post('/register/github', registerInstructorgithub);
router.post('/register/githubStudent', registerStudentgithub);
router.post('/register/googleStudent', registerStudentgoogle);
router.post('/register/linkedinInstructor', registerInstructorLinkedin);
router.post('/register/linkedinStudent', registerStudentLinkedin);
router.post('/resend-verification', resendVerificationCode);
router.post("/loginLinkedIn", signInlinkedin);
router.post("/login", checkUserIsActive, signIn);
router.post("/logingoogle", checkUserIsActive, signIngoogle);
router.post("/loginGit", signIngithub);
router.post("/logout", signOut);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/completedchapters", markChapterAsCompleted);



module.exports = router;