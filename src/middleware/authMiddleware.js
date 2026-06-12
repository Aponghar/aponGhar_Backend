const jwt = require("jsonwebtoken");



const authMiddleware = (req, res, next) => {

    try {

        // GET AUTH HEADER
        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        // FORMAT: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        // VERIFY TOKEN
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ATTACH USER TO REQUEST
        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};



module.exports = authMiddleware;