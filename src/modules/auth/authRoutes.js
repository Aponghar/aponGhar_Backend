const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const authLimiter =
    require("../../middleware/security/authLimiter");
    
const {
    register,
    login,
    googleLogin,
    getMe,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
    getAuthConfig
} = require("./authController");



// PUBLIC
router.get("/config", getAuthConfig);

router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

router.post("/google", authLimiter, googleLogin);

router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", authLimiter, resetPassword);


// PROTECTED
router.get("/me", authMiddleware, getMe);

router.post(
    "/send-otp",
    authLimiter,
    authMiddleware,
    sendOTP
);

router.post(
    "/verify-otp",
    authLimiter,
    authMiddleware,
    verifyOTP
);



module.exports = router;