const express = require("express");
const { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, upload ,getQuizById,assignedQuizToChapter,getQuizzesByChapter,saveresultuser,getuserattempts} = require("../controllers/quizController");

const { verifyToken } = require("../middlewares/verifyToken");  

const router = express.Router();


router.get("/get", getAllQuizzes);
router.get("/get/:quizId", getQuizById);

router.post("/add", upload.single('quizFile'), createQuiz);
router.post("/submit", saveresultuser);
router.post("/assign-quizzes", assignedQuizToChapter);
router.get("/getquiz/:chapterId", getQuizzesByChapter); 
router.get("/user-attempts/:userId", getuserattempts); 
router.put("/update/:quizId", updateQuiz);



router.delete("/delete/:quizId", deleteQuiz);

module.exports = router;
