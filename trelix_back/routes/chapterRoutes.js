const express = require("express");
const { getChapters, createChapter, updateChapter, deleteChapter, upload, assignChapters, getChaptersByCourse, markChapterAsCompleted } = require("../controllers/chapterController");
const { verifyToken } = require("../middlewares/verifyToken");
const { identifyActingUser } = require("../middlewares/logActivityMiddleware");
const router = express.Router();

router.post("/markCompleted", markChapterAsCompleted)
router.get("/get", getChapters);
router.post("/add", upload.fields([{ name: "pdf" }, { name: "video" }]), createChapter);
router.post("/assign-chapters", assignChapters);
router.get("/course/:slugCourse", identifyActingUser, getChaptersByCourse);
router.put("/chapters", updateChapter);
router.delete("/delete/:id", deleteChapter);

module.exports = router;