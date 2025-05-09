var express = require('express');
var router = express.Router();
const {recommendUser} = require('../controllers/recommendationController');
const {verifyToken} = require('../middlewares/verifyToken');
router.get('/recommendation',verifyToken, recommendUser);
module.exports = router;