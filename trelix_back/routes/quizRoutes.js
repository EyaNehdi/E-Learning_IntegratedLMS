const express = require("express");
const { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz, upload ,getQuizById} = require("../controllers/quizController");

const { verifyToken } = require("../middlewares/verifyToken");  

const router = express.Router();


router.get("/get", getAllQuizzes);
router.get("/get/:quizId", getQuizById);

router.post("/add", upload.single('quizFile'), createQuiz);


router.put("/update/:quizId", updateQuiz);


router.delete("/delete/:quizId", deleteQuiz);

module.exports = router;
