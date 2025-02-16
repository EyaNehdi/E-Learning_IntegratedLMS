const express = require('express');
const router = express.Router();
const { registerStudent, registerInstructor, checkAuth, signIn,signOut } = require('../controllers/authController');
const { verifyToken } = require ('../middlewares/verifyToken.js');

router.get('/check-auth', verifyToken, checkAuth);
router.post('/register/student', registerStudent);

router.post('/register/instructor', registerInstructor);

router.post("/login", signIn);
router.post("/logout", signOut);

module.exports = router;