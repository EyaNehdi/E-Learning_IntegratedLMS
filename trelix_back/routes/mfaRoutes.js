const express = require("express");
const router = express.Router();
const mfaController = require("../controllers/mfaController");

router.post("/enable", mfaController.enableMFA);
router.post("/verify", mfaController.authenticateMfa);
router.get("/backup-codes", mfaController.generateBackupCodes);
module.exports = router;
