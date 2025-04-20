const User = require("../models/userModel");


const checkUserIsActive = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Server error during user status check." });
    }
};

module.exports = { checkUserIsActive };