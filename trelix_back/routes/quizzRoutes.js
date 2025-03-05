var express = require('express');
var router = express.Router();
const { addQuizz , getDailyQuizz , getScoresLeaderBoard } = require ('../controllers/quizzController');

router.post('/add', addQuizz);
router.get('/daily',getDailyQuizz);
router.get('/leaderboard',getScoresLeaderBoard);

module.exports = router;