const express = require('express');
const router = express.Router();
const { sendEmail , sendVerificationEmail, sendVerificationConfirmation} = require('../API/mailer'); // use this if using module.exports = sendEmail

router.post("/api/send-email", sendEmail);
router.post("/api/verify-email", sendVerificationEmail);
router.post('/api/send-verification-confirmation', sendVerificationConfirmation);

module.exports = router;