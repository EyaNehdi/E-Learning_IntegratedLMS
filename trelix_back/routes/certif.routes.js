const express = require("express");
const router = express.Router();
const certifController = require("../controllers/certifController");

router.post("/issueCertificate", certifController.issueCertificate);

router.get("/getUserCertificates",certifController.getUserCertificates);

router.get("/getCertAll", certifController.getAllCertifWithOwnedStatus);

router.get("/getProgress", certifController.getUserAchievements);

module.exports = router;