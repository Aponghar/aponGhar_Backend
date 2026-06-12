const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const {

    dashboard,

    getUsers,

    getPendingApplications,

    approveApplication,

    rejectApplication,

    getPendingProperties,

    approveProperty,

    rejectProperty,

    getBookings,

    getRefunds,

    monthlyRevenue,

    refundAnalytics,

    bookingAnalytics,

    topProperties,

    ownerPerformance,

    platformKPIs,

    getApprovedOwners,

    getAllProperties,

    deactivatePropertyByAdmin,

    activatePropertyByAdmin,

    deletePropertyByAdmin,

    setCommission,

    getPendingCheckIns,

    recordCheckInAdmin,

    getEarnings,

    requestCommissionPayment,

    confirmCommissionPayment,

    getCommissionsByOwner,

    creditWallet

} = require("./adminController");



// ALL ROUTES REQUIRE ADMIN
router.use(

    authMiddleware,

    roleMiddleware("ADMIN")
);



// DASHBOARD
router.get(

    "/dashboard",

    dashboard
);



// USERS
router.get(

    "/users",

    getUsers
);



// PENDING OWNER APPLICATIONS
router.get(

    "/owner-applications",

    getPendingApplications
);



// APPROVE OWNER
router.patch(

    "/owner-applications/approve/:applicationId",

    approveApplication
);



// REJECT OWNER
router.patch(

    "/owner-applications/reject/:applicationId",

    rejectApplication
);

// PENDING PROPERTIES
router.get(

    "/properties/pending",

    getPendingProperties
);



// APPROVE PROPERTY
router.patch(

    "/properties/approve/:propertyId",

    approveProperty
);



// REJECT PROPERTY
router.patch(

    "/properties/reject/:propertyId",

    rejectProperty
);

// ALL BOOKINGS
router.get(

    "/bookings",

    getBookings
);



// REFUND BOOKINGS
router.get(

    "/refunds",

    getRefunds
);

// MONTHLY REVENUE
router.get(

    "/analytics/revenue",

    monthlyRevenue
);



// REFUND ANALYTICS
router.get(

    "/analytics/refunds",

    refundAnalytics
);



// BOOKING ANALYTICS
router.get(

    "/analytics/bookings",

    bookingAnalytics
);



// TOP PROPERTIES
router.get(

    "/analytics/top-properties",

    topProperties
);



// OWNER PERFORMANCE
router.get(

    "/analytics/owners",

    ownerPerformance
);



// PLATFORM KPIs
router.get(

    "/analytics/kpis",

    platformKPIs
);

router.get(
    "/owners",
    getApprovedOwners
);

router.get(
    "/properties",
    getAllProperties
);

router.patch(
    "/properties/:propertyId/deactivate",
    deactivatePropertyByAdmin
);

router.patch(
    "/properties/:propertyId/activate",
    activatePropertyByAdmin
);

router.delete(
    "/properties/:propertyId",
    deletePropertyByAdmin
);

router.patch(
    "/properties/:propertyId/commission",
    setCommission
);

// CHECK-IN AND COMMISSION ROUTES
router.get(
    "/checkins/pending",
    getPendingCheckIns
);

router.patch(
    "/checkins/:checkinId/record",
    recordCheckInAdmin
);

router.get(
    "/earnings",
    getEarnings
);

// COMMISSION PAYMENT REQUEST ENDPOINTS
router.post(
    "/commissions/:commissionId/request-payment",
    requestCommissionPayment
);

router.patch(
    "/commissions/:commissionId/confirm-payment",
    confirmCommissionPayment
);

router.get(
    "/commissions/owner/:ownerId",
    getCommissionsByOwner
);

router.post(
    "/wallets/credit",
    creditWallet
);

module.exports = router;
