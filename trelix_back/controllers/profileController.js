const User = require ('../models/userModel');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("firstName lastName"); // Fetch only necessary fields

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
        console.log("user from the backend function"+user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getUserProfile };