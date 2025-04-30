var express = require('express');
var router = express.Router();
const { getRecommendedCourses } = require('../controllers/PreferenceController');

router.get('/recommended-courses', getRecommendedCourses);

module.exports = router;

