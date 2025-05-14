var express = require('express');
var router = express.Router();
const {fetchCitation} = require('../controllers/citationController');

router.get('/api/quote',fetchCitation);
module.exports = router