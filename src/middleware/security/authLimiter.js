const rateLimit = require("express-rate-limit");

// Strict rate limiter for authentication endpoints
// 5 requests per 15 minutes to prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15,
    message: {
        success: false,
        message:
            "Too many login attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    }
});

module.exports = authLimiter;