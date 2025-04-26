const jwt = require("jsonwebtoken");
const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    // console.log("🟢 Token from cookie:", token); // Log the token received by the server
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		req.userId = decoded.userId;
		//console.log("User ID in verifyToken:", req.userId);  // Log here to confirm userId is set
		next();
	} catch (error) {
		//console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};


module.exports = {verifyToken};