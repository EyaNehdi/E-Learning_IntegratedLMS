// routes/googleAuth.js
const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');
const isAuthenticated = require('../middlewares/auth.middleware');

// Routes d'authentification
router.get('/login', googleAuthController.googleLogin);
router.get('/callback', googleAuthController.googleCallback);
router.get('/check-auth', googleAuthController.checkAuth);
router.get('/logout', googleAuthController.logout);

module.exports = router;