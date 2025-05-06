const express = require("express");
const {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    duplicateExam,
    exportAllExamResults,
    getExamss,
    assignExamsToCourse,
    getRandomExamFromCourse,
    getuserattempts,
    handleSubmitExam,
    checkAttempt,
    checkstatus,
    upload,
    getallExams
} = require("../controllers/ExamController");

const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/get", verifyToken, getExams);
router.get("/getall", verifyToken, getallExams);
router.get("/gett", verifyToken, getExamss);
router.get("/get/:id", verifyToken, getExamById);

router.post("/add", verifyToken, upload.single("examFile"), createExam);
router.post("/assign-exams", verifyToken, assignExamsToCourse);
router.post('/submit/:examId', verifyToken, handleSubmitExam);

// Route for fetching user exam attempts
router.get('/user/:userId/attempts', verifyToken, getuserattempts);

router.put("/update/:examId", verifyToken, updateExam);
router.get("/random/:courseId", getRandomExamFromCourse); 
router.get("/check-attempt/:courseId/:userId", checkAttempt); 
router.get("/check-status/:courseId/:userId", checkstatus);

router.delete("/delete/:examId", verifyToken, deleteExam);
router.post("/publish/:examId", verifyToken, publishExam);
router.post("/duplicate/:examId", verifyToken, duplicateExam);
router.get("/results/export-all", exportAllExamResults);



module.exports = router;
