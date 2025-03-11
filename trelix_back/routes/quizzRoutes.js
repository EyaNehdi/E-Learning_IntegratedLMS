var express = require('express');
var router = express.Router();
const { addQuizz,activeQuizz,checkUserAttempt,activeQuizQuestions,submitQuiz ,leaderboard } = require ('../controllers/quizzLeaderboardController');
const { verifyToken} = require ("../middlewares/verifyToken");

router.post("/addQuiz", addQuizz);
router.get("/active",activeQuizz);
router.get('/check-attempt/:quizId',verifyToken,checkUserAttempt);
router.get("/active-questions",activeQuizQuestions);
router.post("/submit",verifyToken,submitQuiz);
router.get('/leaderboard',leaderboard);
module.exports = router;