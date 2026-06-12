const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const {

    createOrder,
    
    verifyPayment,

    markPaymentFailed,

    createCommissionOrder,

    verifyCommissionPayment,

    markCommissionPaymentFailed,

    refundPayment,

    getTransactions

} = require("./paymentController");



// CREATE PAYMENT ORDER
router.post(

    "/create-order/:bookingId",

    authMiddleware,

    createOrder
);

// VERIFY PAYMENT
router.post(

    "/verify-payment",

    authMiddleware,

    verifyPayment
);

// MARK BOOKING PAYMENT FAILED / DISMISSED
router.post(

    "/payment-failed",

    authMiddleware,

    markPaymentFailed
);

// CREATE OWNER COMMISSION PAYMENT ORDER
router.post(

    "/commissions/:commissionId/create-order",

    authMiddleware,

    roleMiddleware("OWNER"),

    createCommissionOrder
);

// VERIFY OWNER COMMISSION PAYMENT
router.post(

    "/commissions/verify-payment",

    authMiddleware,

    roleMiddleware("OWNER"),

    verifyCommissionPayment
);

// MARK OWNER COMMISSION PAYMENT FAILED / DISMISSED
router.post(

    "/commissions/payment-failed",

    authMiddleware,

    roleMiddleware("OWNER"),

    markCommissionPaymentFailed
);

// REFUND PAYMENT
router.post(

    "/refund/:bookingId",

    authMiddleware,

    refundPayment
);



// GET USER TRANSACTIONS
router.get(

    "/my-transactions",

    authMiddleware,

    getTransactions
);


module.exports = router;
