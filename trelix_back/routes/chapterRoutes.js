const express = require("express");
const {getChapters, createChapter, updateChapter, deleteChapter ,upload,assignChapters,getChaptersByCourse} = require("../controllers/chapterController");


const { verifyToken } = require("../middlewares/verifyToken");



const router = express.Router();








router.get("/get", getChapters);
router.post("/add", upload.fields([{ name: "pdf" }, { name: "video" }]), createChapter);
router.post("/assign-chapters", assignChapters);
router.get("/course/:courseId", getChaptersByCourse);
router.put("/chapters", updateChapter);
router.delete("/delete/:id", deleteChapter);

module.exports = router;