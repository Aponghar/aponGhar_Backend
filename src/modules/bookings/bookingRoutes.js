const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");
    
const bookingLimiter =
    require("../../middleware/security/bookingLimiter");
    
const {

    createBooking,

    confirmBooking,

    cancelBooking,

    rejectBookingRequest,

    getMyBookings,

    getOwnerBookings,

    getBookingDetails

} = require("./bookingController");



// CREATE BOOKING
router.post(

    "/",

    authMiddleware,

    bookingLimiter,

    createBooking
);



// CONFIRM BOOKING
router.patch(

    "/:bookingId/confirm",

    authMiddleware,

    bookingLimiter,

    confirmBooking
);

// REJECT BOOKING
router.patch(

    "/:bookingId/reject",

    authMiddleware,

    bookingLimiter,

    roleMiddleware("OWNER"),

    rejectBookingRequest
);



// CANCEL BOOKING
router.patch(

    "/:bookingId/cancel",

    authMiddleware,

    bookingLimiter,

    cancelBooking
);



// GET MY BOOKINGS
router.get(

    "/my-bookings",

    authMiddleware,

    bookingLimiter,

    getMyBookings
);

// OWNER BOOKINGS DASHBOARD
router.get(

    "/owner/dashboard",

    authMiddleware,

    bookingLimiter,

    roleMiddleware("OWNER"),

    getOwnerBookings
);



// GET BOOKING DETAILS
router.get(

    "/owner/:bookingId",

    authMiddleware,

    roleMiddleware("OWNER"),

    bookingLimiter,

    getBookingDetails
);


module.exports = router;
