const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const {
    userDashboard,
    ownerDashboard,
    adminDashboard,
    getProfile,
    updateProfile,
    changePassword
} = require("./userController");



// USER ACCESS
router.get(
    "/user-dashboard",

    authMiddleware,

    roleMiddleware(
        "USER",
        "OWNER",
        "ADMIN"
    ),

    userDashboard
);



// OWNER ACCESS
router.get(
    "/owner-dashboard",

    authMiddleware,

    roleMiddleware(
        "OWNER",
        "ADMIN"
    ),

    ownerDashboard
);



// ADMIN ACCESS
router.get(
    "/admin-dashboard",

    authMiddleware,

    roleMiddleware(
        "ADMIN"
    ),

    adminDashboard
);

// PROFILE ROUTES
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;