//iq.js router
const express = require('express');
const router = express.Router();
const { handleFileUpload, analyzeCV } = require('../controllers/iacontroller');

router.post("/CV", 
  handleFileUpload, // Custom middleware
  analyzeCV
);

module.exports = router;