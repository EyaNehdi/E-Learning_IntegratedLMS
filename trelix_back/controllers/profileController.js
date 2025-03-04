const User = require("../models/userModel");
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});


const upload = multer({ storage });

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("firstName lastName email mfaEnabled image profilePhoto coverPhoto phone skils badges"); // Include photos

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update Profile Photo
const updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const profilePhotoUrl = `/uploads/${req.file.filename}`;
        await User.findByIdAndUpdate(req.userId, { profilePhoto: profilePhotoUrl });

        res.status(200).json({ profilePhoto: profilePhotoUrl });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile photo" });
    }
};

// Update Cover Photo
const updateCoverPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const coverPhotoUrl = `/uploads/${req.file.filename}`;
        await User.findByIdAndUpdate(req.userId, { coverPhoto: coverPhotoUrl });

        res.status(200).json({ coverPhoto: coverPhotoUrl });
    } catch (error) {
        res.status(500).json({ message: "Error updating cover photo" });
    }
};
const updatebadge = async (req, res) => {
    const { badge, email, badgeImage } = req.body; // Get badge, email, and badgeImage from request body
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Check if the badge already exists in the user's badges
      const badgeExists = user.badges.some(b => b.name === badge);
  
      if (badgeExists) {
        return res.status(400).json({ error: "You have already earned this badge." });
      }
  
      // Add the badge with the image to the user's profile
      user.badges.push({ 
        name: badge, 
        description: "Earned for completing profile", 
        image: badgeImage // Add the badge image URL
      });
  
      // Save the updated user profile
      await user.save();
  
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ error: "Badge update failed", message: err.message });
    }
  };
  
const editUserProfile = async (req, res) => {
    try {
        const { email, ...updateFields } = req.body; // Extract email and changed field(s)

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update only the changed field(s)
        const updatedUser = await User.findOneAndUpdate(
            { email },    // Find user by email
            { $set: updateFields }, // Update only the changed field(s)
            { new: true, runValidators: true } // Return updated user and apply validation
        ).select("firstName lastName email mfaEnabled profilePhoto coverPhoto phone skils");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};  
module.exports = { 
    getUserProfile, 
    updateProfilePhoto, 
    updateCoverPhoto,
    editUserProfile, 
    upload ,
    updatebadge// Export multer upload configuration
};
