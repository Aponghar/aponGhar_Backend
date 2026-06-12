const express = require("express");

const healthRoutes =
    require("./healthRoutes");

const authRoutes =
    require("../modules/auth/authRoutes");

const userRoutes =
    require("../modules/users/userRoutes");

const ownerRoutes =
    require("../modules/owners/ownerRoutes");

const propertyRoutes =
    require("../modules/properties/propertyRoutes");

const roomRoutes =
    require("../modules/rooms/roomRoutes");

const bookingRoutes =
    require("../modules/bookings/bookingRoutes");

const paymentRoutes =
    require("../modules/payments/paymentRoutes");

const reviewRoutes =
    require("../modules/reviews/reviewRoutes");

const notificationRoutes =
    require("../modules/notifications/notificationRoutes");    

const adminRoutes =
    require("../modules/admin/adminRoutes");

const financeRoutes =
    require("../modules/finance/financeRoutes");

const couponRoutes =
    require("../modules/coupons/couponRoutes");

const checkinRoutes =
    require("../modules/checkins/checkinRoutes");

const wishlistRoutes =
    require("../modules/wishlist/wishlistRoutes");

const advertisementRoutes =
    require("../modules/advertisements/adRoutes");


const router = express.Router();



// HEALTH
router.use("/health", healthRoutes);



// AUTH
router.use("/auth", authRoutes);



// USER TEST ROUTES
router.use("/users", userRoutes);

// OWNER APPLICATION ROUTES
router.use("/owners", ownerRoutes);

// PROPERTY ROUTES
router.use("/properties",propertyRoutes);

// ROOM ROUTES
router.use("/rooms", roomRoutes);


// BOOKING ROUTES
router.use("/bookings",bookingRoutes);
    

// PAYMENT ROUTES
router.use("/payments", paymentRoutes);

// REVIEW ROUTES
router.use("/reviews", reviewRoutes);

router.use("/notifications",notificationRoutes);

// ADMIN ROUTES
router.use("/admin", adminRoutes);

// FINANCE ROUTES
router.use("/finance", financeRoutes);

// COUPON ROUTES
router.use("/coupons",couponRoutes);

// CHECK-IN ROUTES
router.use("/checkins", checkinRoutes);

// WISHLIST ROUTES
router.use("/wishlist", wishlistRoutes);

// ADVERTISEMENT ROUTES
router.use("/advertisements", advertisementRoutes);

module.exports = router;