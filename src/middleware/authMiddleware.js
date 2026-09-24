const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {
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

        // VERIFY TOKEN SIGNATURE & EXPIRY
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // FETCH CURRENT USER & REAL-TIME ROLE FROM DATABASE
        const [users] = await pool.query(
            "SELECT id, full_name, email, role, is_active FROM users WHERE id = ?",
            [decoded.id]
        );

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists"
            });
        }

        const currentUser = users[0];

        if (!currentUser.is_active) {
            return res.status(403).json({
                success: false,
                message: "User account has been deactivated"
            });
        }

        // ATTACH REAL-TIME USER TO REQUEST
        req.user = {
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.full_name,
            role: currentUser.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;