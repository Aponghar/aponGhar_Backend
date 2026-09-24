const rateLimit =
    require("express-rate-limit");

const globalLimiter =
    rateLimit({
        windowMs:
            15 * 60 * 1000,

        max: parseInt(process.env.RATE_LIMIT_MAX || "1000", 10),

        message: {
            success: false,
            message:
                "Too many requests, please try again later."
        },

        standardHeaders: true,
        legacyHeaders: false
    });

module.exports =
    globalLimiter;