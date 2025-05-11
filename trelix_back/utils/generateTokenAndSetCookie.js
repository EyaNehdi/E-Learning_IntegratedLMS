const jwt = require("jsonwebtoken");

const generateToken = (res, userId, stayLoggedIn) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: stayLoggedIn ? "1d" : "1h",
    });

    // console.log("Generating Token:", token);
    // console.log("Stay Logged In:", stayLoggedIn);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    };

    if (stayLoggedIn) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    // console.log("Setting Cookie:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    return token;
};

module.exports = generateToken;
