const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER =", authHeader);

        if (!authHeader) {
            return res.status(401).json({
                message: "No token, access denied",
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("TOKEN RECEIVED =", token);

        const decoded = jwt.verify(token, "mysecretkey");

        req.user = decoded;

        next();
    } catch (error) {
        console.log("JWT ERROR =", error.message);

        return res.status(401).json({
            message: "Invalid token",
        });
    }
};

module.exports = authMiddleware;