const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

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

const generateTrustedDeviceToken = (userId, deviceId, metadata = {}) => {
    const payload = {
        userId,
        deviceId,
        metadata,
    };

    return jwt.sign(payload, process.env.TRUSTED_DEVICE_SECRET, {
        expiresIn: "30d",
    });
};

const verifyTrustedDeviceToken = (token) => {
    try {
        return jwt.verify(token, process.env.TRUSTED_DEVICE_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { checkUserIsActive, generateTrustedDeviceToken, verifyTrustedDeviceToken };