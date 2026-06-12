const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication endpoints
// 5 requests per 15 minutes to prevent brute force attacks
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message:
            'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // Skip rate limiting in test environment
        return process.env.NODE_ENV === 'test';
    }
});

module.exports = authRateLimiter;
