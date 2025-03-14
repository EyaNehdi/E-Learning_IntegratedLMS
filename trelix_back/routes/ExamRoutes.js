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
    upload
} = require("../controllers/ExamController");

const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/get", verifyToken, getExams);
router.get("/gett", verifyToken, getExamss);
router.get("/get/:id", verifyToken, getExamById);

router.post("/add", verifyToken, upload.single("examFile"), createExam);
router.post("/assign-exams", verifyToken, assignExamsToCourse);

router.put("/update/:examId", verifyToken, updateExam);
router.get("/random/:courseId", getRandomExamFromCourse); 

router.delete("/delete/:examId", verifyToken, deleteExam);
router.post("/publish/:examId", verifyToken, publishExam);
router.post("/duplicate/:examId", verifyToken, duplicateExam);
router.get("/results/export-all", exportAllExamResults);



module.exports = router;
