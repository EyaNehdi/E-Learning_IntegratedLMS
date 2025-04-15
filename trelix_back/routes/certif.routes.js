const express = require("express");
const router = express.Router();
const certifController = require("../controllers/certifController");
const { logActivityMiddleware, identifyActingUser } = require("../middlewares/logActivityMiddleware");

router.post("/issueCertificate", identifyActingUser, logActivityMiddleware('issueCertificate', 'Certificate'), certifController.issueCertificate);

router.get("/getUserCertificates", certifController.getUserCertificates);

router.get("/getCertAll", certifController.getAllCertifWithOwnedStatus);

router.get("/getProgress", certifController.getUserAchievements);

module.exports = router;