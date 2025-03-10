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
    upload
} = require("../controllers/ExamController");

const { verifyToken } = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/get", verifyToken, getExams);
router.get("/get/:examId", verifyToken, getExamById);

router.post("/add", verifyToken, upload.single("examFile"), createExam);

router.put("/update/:examId", verifyToken, updateExam);

router.delete("/delete/:examId", verifyToken, deleteExam);
router.post("/publish/:examId", verifyToken, publishExam);
router.post("/duplicate/:examId", verifyToken, duplicateExam);
router.get("/results/export-all", exportAllExamResults);



module.exports = router;
