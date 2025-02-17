const jwt = require("jsonwebtoken");

const generateToken = (res, userId, stayLoggedIn) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: stayLoggedIn ? "30d" : "1d",
    });

    console.log("Stay Logged In:", stayLoggedIn);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
    };

    if (stayLoggedIn) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie("token", token, cookieOptions);

    return token;
};

module.exports = generateToken;
