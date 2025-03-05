var express = require('express');
var router = express.Router();
const { addQuizz , getDailyQuizz } = require ('../controllers/quizzController');

router.post('/add', addQuizz);
router.get('/daily',getDailyQuizz);

module.exports = router;