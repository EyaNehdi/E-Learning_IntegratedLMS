const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(401).json({ error: "Invalid token" });
        req.id = verified.id;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
module.exports = {verifyToken};