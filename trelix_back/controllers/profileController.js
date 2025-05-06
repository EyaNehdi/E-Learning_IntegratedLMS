const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

// Configure multer storage for file uploads (profile and cover photos)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // Set upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Generate unique filename
    }
});

const upload = multer({ storage });

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("firstName lastName email mfa image profilePhoto coverPhoto phone skils badges role Bio certificatesOwned balance"); // Select only the fields you need

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user) {
            const certificateCount = user.certificatesOwned.length;
            const userProfile_Details = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mfa: user.mfa,
                image: user.image,
                profilePhoto: user.profilePhoto,
                coverPhoto: user.coverPhoto,
                phone: user.phone,
                skils: user.skils,
                badges: user.badges,
                role: user.role,
                Bio: user.Bio,
                certificateCount,
                balance: user.balance,
            };
            res.status(200).json(userProfile_Details);
        }

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

// Update User Badges
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
        const { email, ...updateFields } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },    // Find user by email
            { $set: updateFields }, // Update only the changed field(s)
            { new: true, runValidators: true } // Return updated user and apply validation
        ).select("firstName lastName email mfaEnabled profilePhoto coverPhoto phone skils Bio");

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

// Update User Password
const updateUserPassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body
  
      // Validate passwords
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Old and new passwords are required" })
      }
  
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" })
      }
  
      // Find user by ID
      const user = await User.findById(req.userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
  
      // Compare current password
      const isMatch = await user.comparePassword(oldPassword)
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" })
      }
  
      console.log("✅ Old password verified successfully")
  
      // Set the new password directly - let the pre-save hook handle hashing
      user.password = newPassword
      await user.save()
  
      // Verify the password was saved correctly
      const updatedUser = await User.findById(req.userId)
      console.log("Stored password hash after update:", updatedUser.password)
  
      // Test password verification
      const verificationTest = await updatedUser.comparePassword(newPassword)
      console.log("Password verification test:", verificationTest ? "PASSED ✅" : "FAILED ❌")
  
      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      })
    } catch (error) {
      console.error("❌ Error updating password:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  }



const editSkils = async (req, res) => {
    try {
        const { userId, skills } = req.body; // Extract userId and new skills from request

        // Validate request data
        if (!userId || !skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        // Find the user and update their skills
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { skils: skills },
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating skills:", error);
        res.status(500).json({ message: "Error updating skills" });
    }
};
module.exports = {
    getUserProfile,
    updateProfilePhoto,
    updateCoverPhoto,
    editUserProfile,
    upload,
    updatebadge,
    updateUserPassword,
    editSkils// Export multer upload configuration
};
