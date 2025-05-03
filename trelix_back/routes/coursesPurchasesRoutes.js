const express = require('express');
const router = express.Router();
const { purchaseCourse, checkCourseAccess } = require('../controllers/coursesPurchases');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/purchase', verifyToken, purchaseCourse);
router.get('/access/:courseId', verifyToken, checkCourseAccess);

module.exports = router;