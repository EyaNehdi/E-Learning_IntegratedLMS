const express = require("express");
const router = express.Router();
const mfaController = require("../controllers/mfaController");

router.post("/enable", mfaController.enableMFA);
router.post("/verify", mfaController.authenticateMfa);

module.exports = router;
