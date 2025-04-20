const express = require("express");
const router = express.Router();
const { logActivityMiddleware, identifyActingUser } = require("../middlewares/logActivityMiddleware");
const badgeController = require("../controllers/badgeController");
const uploadBadges = require('../utils/multerConfig');

router.post('/createBadge', uploadBadges.single('image'), identifyActingUser, logActivityMiddleware('createBadge', 'Badge'), badgeController.createBadge);
router.get('/get-badges', badgeController.getAllBadges);
router.put('/updateBadge/:id', uploadBadges.single('image'), identifyActingUser, logActivityMiddleware('updateBadge', 'Badge'), badgeController.updateBadge);
router.delete('/deleteBadge/:id', identifyActingUser, logActivityMiddleware('deleteBadge', 'Badge'), badgeController.deleteBadge);

module.exports = router;