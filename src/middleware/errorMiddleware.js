const logger = require("../config/logger");

const errorMiddleware = (
    err,
    req,
    res,
    next
) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        route: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // MULTER ERRORS
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File size exceeds limit (max 5MB)"
        });
    }

    if (err.code === "LIMIT_PART_COUNT") {
        return res.status(400).json({
            success: false,
            message: "Too many file fields"
        });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
            success: false,
            message: "Too many files"
        });
    }

    // Multer validation error
    if (err.message === "Invalid file type") {
        const isReviewUpload =
            req.originalUrl.includes("/reviews");

        return res.status(400).json({
            success: false,
            message: isReviewUpload
                ? "Invalid file type. Only JPEG, PNG, and WEBP are allowed"
                : "Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed"
        });
    }

    // JWT ERRORS
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired"
        });
    }

    // DATABASE ERRORS
    if (err.code === "ER_DUP_ENTRY") {
        let message = "Duplicate entry found";
        if (err.message && err.message.includes("users.phone")) {
            message = "Phone number is already registered by another account";
        } else if (err.message && err.message.includes("users.email")) {
            message = "Email is already registered by another account";
        }
        return res.status(409).json({
            success: false,
            message: message
        });
    }

    if (err.code === "ER_NO_REFERENCED_ROW") {
        return res.status(400).json({
            success: false,
            message: "Referenced record not found"
        });
    }

    // VALIDATION ERRORS - don't expose details
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            message: err.details[0].message
        });
    }

    // GENERIC ERROR - don't expose stack trace in production
    const statusCode = err.statusCode || 500;
    const message = 
        process.env.NODE_ENV === 'production'
            ? 'An error occurred processing your request'
            : err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = errorMiddleware;
