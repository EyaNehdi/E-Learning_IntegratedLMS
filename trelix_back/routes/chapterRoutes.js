const express = require("express");
const {getChapters, createChapter, updateChapter, deleteChapter ,upload} = require("../controllers/chapterController");


const { verifyToken } = require("../middlewares/verifyToken");



const router = express.Router();








router.get("/get", getChapters);
router.post("/add", upload.fields([{ name: "pdf" }, { name: "video" }]), createChapter);

router.put("/chapters", updateChapter);
router.delete("/delete/:id", deleteChapter);

module.exports = router;