var express = require('express');
var router = express.Router();
const { addQuizz,activeQuizz,checkUserAttempt,activeQuizQuestions } = require ('../controllers/quizzLeaderboardController');
const { verifyToken} = require ("../middlewares/verifyToken");

router.post("/addQuiz", addQuizz);
router.get("/active",activeQuizz);
router.get('/check-attempt/:quizId',verifyToken,checkUserAttempt);
router.get("/active-questions",activeQuizQuestions);
module.exports = router;