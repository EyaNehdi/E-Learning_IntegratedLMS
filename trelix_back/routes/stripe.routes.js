var express = require('express');
var router = express.Router();
const {checkoutSession , handleWebhook , verifySession,sessionStatus} = require('../controllers/stripeController');
const {verifyToken} = require('../middlewares/verifyToken');

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.post('/create-checkout-session',verifyToken,checkoutSession);
router.get('/verify-session/:sessionId', verifyToken, verifySession);
router.get('/session-status',sessionStatus);

module.exports = router;