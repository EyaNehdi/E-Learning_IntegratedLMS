var express = require('express');
var router = express.Router();
const { createpreference, getAllPreference ,updatePreference} = require('../controllers/PreferenceController');

router.post("/add", createpreference);
router.get("/get", getAllPreference);
router.put("/update/:id", updatePreference);



module.exports = router;