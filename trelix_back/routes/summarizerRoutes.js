// backend/routes/summarizerRoutes.js
const express = require('express');
const { summarizePdf } = require('../controllers/summarizerController');
const multer = require('multer');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Assurez-vous que la route est correcte
router.post('/pdf', upload.single('file'), summarizePdf);

module.exports = router;
