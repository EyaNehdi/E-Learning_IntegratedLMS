const express = require('express');
const router = express.Router();
const { purchaseCourse, checkCoursesAccessBulk } = require('../controllers/coursesPurchases');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/purchase', verifyToken, purchaseCourse);
router.post('/access/bulk', verifyToken, checkCoursesAccessBulk);

module.exports = router;