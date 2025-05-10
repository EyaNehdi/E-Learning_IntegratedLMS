var express = require('express');
var router = express.Router();
const { createpreference, getAllPreference ,getPreferencesByUserId} = require('../controllers/PreferenceController');

router.post("/add", createpreference);
router.get("/get", getAllPreference);
router.get("/:id", getPreferencesByUserId);



module.exports = router;
