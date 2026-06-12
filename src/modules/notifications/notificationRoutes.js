const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const {

    getMyNotifications,

    markNotificationRead

} = require("./notificationController");



// GET MY NOTIFICATIONS
router.get(

    "/",

    authMiddleware,

    getMyNotifications
);



// MARK AS READ
router.patch(

    "/read/:notificationId",

    authMiddleware,

    markNotificationRead
);



module.exports = router;