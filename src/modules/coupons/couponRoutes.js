const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const couponLimiter =
    require("../../middleware/security/couponLimiter");

const {

    createCoupon,

    validateCoupon,

    getOwnerCoupons,

    getCouponDetails,

    toggleCoupon,

    deleteCoupon

} = require("./couponController");



// GET OWNER COUPONS
router.get(

    "/my-coupons",

    authMiddleware,

    roleMiddleware("OWNER", "ADMIN"),

    getOwnerCoupons
);



// GET COUPON DETAILS
router.get(

    "/:id",

    authMiddleware,

    roleMiddleware("OWNER", "ADMIN"),

    getCouponDetails
);



// CREATE COUPON
router.post(

    "/",

    authMiddleware,

    roleMiddleware("OWNER", "ADMIN"),

    couponLimiter,

    createCoupon
);



// VALIDATE COUPON
router.post(

    "/validate",

    authMiddleware,

    couponLimiter,

    validateCoupon
);



// TOGGLE COUPON STATUS
router.patch(

    "/:id/toggle",

    authMiddleware,

    roleMiddleware("OWNER", "ADMIN"),

    toggleCoupon
);



// DELETE COUPON
router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware("OWNER", "ADMIN"),

    deleteCoupon
);



module.exports = router;