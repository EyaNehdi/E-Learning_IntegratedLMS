var express = require('express');
var router = express.Router();
const { createpreference, getAllPreference } = require('../controllers/PreferenceController');

router.post("/add", createpreference);
router.get("/get", getAllPreference);

module.exports = router;
