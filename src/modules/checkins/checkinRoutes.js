const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");

const {
  initiateCheckIn,
  getOwnerBookingForCheckIn,
  ownerCheckIn,
  getOwnerCheckInHistory,
  getPropertyCheckIns,
  confirmCheckIn,
  recordCheckIn,
  getPendingCheckIns,
  getAdminCheckIns,
  getPendingCommissions,
  getCommissionSummary,
  getOwnerCommissions,
  getOwnerCommissionSummary,
  payCommission,
  ownerCheckOut,
} = require("./checkinController");

router.post("/", authMiddleware, initiateCheckIn);

router.get(
  "/owner/booking/:bookingCode",
  authMiddleware,
  roleMiddleware("OWNER"),
  getOwnerBookingForCheckIn
);

router.post(
  "/owner/checkin",
  authMiddleware,
  roleMiddleware("OWNER"),
  ownerCheckIn
);

router.get(
  "/owner/history",
  authMiddleware,
  roleMiddleware("OWNER"),
  getOwnerCheckInHistory
);

router.get(
  "/owner/property/:propertyId",
  authMiddleware,
  roleMiddleware("OWNER"),
  getPropertyCheckIns
);

router.patch(
  "/:checkinId/confirm",
  authMiddleware,
  roleMiddleware("OWNER"),
  confirmCheckIn
);

router.get(
  "/owner/pending",
  authMiddleware,
  roleMiddleware("OWNER"),
  getPendingCheckIns
);

router.patch(
  "/owner/:checkinId/checkout",
  authMiddleware,
  roleMiddleware("OWNER"),
  ownerCheckOut
);

router.get(
  "/owner/commissions",
  authMiddleware,
  roleMiddleware("OWNER"),
  getOwnerCommissions
);

router.get(
  "/owner/commissions/summary",
  authMiddleware,
  roleMiddleware("OWNER"),
  getOwnerCommissionSummary
);

router.post(
  "/owner/commissions/:commissionId/pay",
  authMiddleware,
  roleMiddleware("OWNER"),
  payCommission
);

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/admin/pending", getAdminCheckIns);

router.patch("/:checkinId/record", recordCheckIn);

router.get(
  "/admin/commissions/pending",
  getPendingCommissions
);

router.get(
  "/admin/commissions/summary",
  getCommissionSummary
);

module.exports = router;
