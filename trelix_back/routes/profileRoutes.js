const express = require("express");
const { getUserProfile, updateProfilePhoto, updateCoverPhoto, upload, editUserProfile, updatebadge } = require("../controllers/profileController");
const { verifyToken } = require("../middlewares/verifyToken");


const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile/edit",editUserProfile)
router.post("/profile/badge",updatebadge)
router.put("/profile/photo", verifyToken, upload.single("profilePhoto"), updateProfilePhoto);
router.put("/profile/cover", verifyToken, upload.single("coverPhoto"), updateCoverPhoto);

module.exports = router;
