const express = require("express");
const router = express.Router();
const mfaController = require("../controllers/mfaController");
const { verifyPassword } = require("../services/mfaService");

router.post("/enable", mfaController.enableMFA);
router.post("/verify", mfaController.authenticateMfa);
router.get("/backup-codes", mfaController.generateBackupCodes);
router.get("/get-codes", mfaController.getBackupCodes);
router.put("/disable-mfa", mfaController.disableMFA);
router.put("/disable-mfa-profile", verifyPassword, mfaController.disableMFA);
router.post("/verifyMfaCode", mfaController.verifyMfaCode);
router.get("/get-trusted", mfaController.getTrusted);
router.delete("/remove-device", mfaController.removeDevice);
module.exports = router;