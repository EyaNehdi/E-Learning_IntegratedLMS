const jwt = require ("jsonwebtoken");

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "Lax",  // Prevents cross-site issues while allowing auth
		path: "/",        // Ensures it's accessible across routes
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});
	
    return token;
};

module.exports =  generateToken ;