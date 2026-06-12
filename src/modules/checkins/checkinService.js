const checkinRepository = require("./checkinRepository");
const {
  deriveIncludedCommission,
  toMoney,
} = require("../../utils/pricing");

const normalizeBookingCode = (bookingCode) =>
  String(bookingCode || "").trim().toUpperCase();

const getOwnerBookingForCheckIn = async (ownerId, bookingCode) => {
  const normalizedCode = normalizeBookingCode(bookingCode);

  if (!normalizedCode) {
    throw new Error("Booking code is required");
  }

  const booking = await checkinRepository.findBookingByCode(
    normalizedCode,
    ownerId
  );

  if (!booking) {
    throw new Error("Booking not found for your property");
  }

  const availableRooms =
    await checkinRepository.getAvailableAssignedRoomsForBooking(
      ownerId,
      booking
    );

  return {
    ...booking,
    available_rooms: availableRooms,
  };
};

const ownerCheckIn = async (ownerId, bookingCode, assignedRoomId) => {
  const booking = await getOwnerBookingForCheckIn(ownerId, bookingCode);

  if (booking.booking_status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be checked in");
  }

  const existingCheckIn =
    await checkinRepository.getCheckInByBookingId(booking.id);

  if (existingCheckIn) {
    throw new Error("This booking has already been checked in");
  }

  const assignedRoom =
    await checkinRepository.getAssignableRoomForBooking(
      ownerId,
      booking,
      assignedRoomId
    );

  if (!assignedRoom) {
    throw new Error("Selected room is not available for this booking");
  }

  const commissionPercentage = toMoney(
    booking.booking_commission_percentage ?? booking.commission_percentage
  );
  const snapshotCommission = toMoney(booking.booking_commission_amount);
  const fallbackPricing = deriveIncludedCommission(
    booking.total_amount,
    commissionPercentage
  );

  const result = await checkinRepository.createCheckIn({
    booking_id: booking.id,
    user_id: booking.user_id,
    owner_id: ownerId,
    property_id: booking.property_id,
    room_id: booking.room_id,
    assigned_room_id: assignedRoom.id,
    booking_amount: booking.total_amount,
    commission_percentage: commissionPercentage,
    commission_amount:
      snapshotCommission > 0
        ? snapshotCommission
        : fallbackPricing.commissionAmount,
  });

  try {
    const financeService = require("../finance/financeService");
    await financeService.unlockOwnerEarning(booking.id);
  } catch (err) {
    console.error("Failed to unlock owner earning in ownerCheckIn:", err.message);
  }

  return {
    message: "Guest checked in successfully",
    checkInId: result.insertId,
    assigned_room_id: assignedRoom.id,
    assigned_room_code: assignedRoom.room_id,
  };
};

const getOwnerCheckInHistory = async (ownerId) => {
  return checkinRepository.getAllCheckInsForOwner(ownerId);
};

const getPropertyCheckIns = async (ownerId, propertyId) => {
  return checkinRepository.getCheckInsByProperty(propertyId, ownerId);
};

const initiateCheckIn = async () => {
  throw new Error("User-initiated check-in has been disabled");
};

const confirmCheckIn = async (checkinId, ownerId) => {
  const result = await checkinRepository.confirmCheckInByOwner(
    checkinId,
    ownerId
  );

  if (result.affectedRows === 0) {
    throw new Error("Check-in not found or already confirmed");
  }

  try {
    const checkIn = await checkinRepository.getCheckInById(checkinId);
    if (checkIn) {
      const financeService = require("../finance/financeService");
      await financeService.unlockOwnerEarning(checkIn.booking_id);
    }
  } catch (err) {
    console.error("Failed to unlock owner earning in confirmCheckIn:", err.message);
  }

  return {
    message: "Check-in confirmed successfully",
  };
};

const recordCheckIn = async (checkinId) => {
  await checkinRepository.recordCheckInByAdmin(checkinId);

  return {
    message: "Check-in recorded and commission added",
  };
};

const getPendingCheckInsOwner = async (ownerId) => {
  return checkinRepository.getPendingCheckInsForOwner(ownerId);
};

const getPendingCheckInsAdmin = async () => {
  return checkinRepository.getPendingCheckInsForAdmin();
};

const getCommissionsForAdmin = async (filters = {}) => {
  return checkinRepository.getCommissionsForAdmin(filters);
};

const getCommissionSummaryData = async (filters = {}) => {
  return checkinRepository.getCommissionSummary(filters);
};

const getOwnerCommissions = async (ownerId, filters = {}) => {
  return checkinRepository.getCommissionsForOwner(ownerId, filters);
};

const getOwnerCommissionSummary = async (ownerId, filters = {}) => {
  return checkinRepository.getCommissionSummaryForOwner(ownerId, filters);
};

const payCommission = async (ownerId, commissionId, paymentData) => {
  if (!paymentData.payment_method) {
    throw new Error("Payment method is required");
  }

  const result = await checkinRepository.markCommissionPaidByOwner(
    commissionId,
    ownerId,
    paymentData
  );

  if (result.affectedRows === 0) {
    throw new Error("Commission not found, does not belong to you, or is already paid");
  }

  return {
    message: "Commission payment marked as paid successfully",
  };
};

const ownerCheckOut = async (ownerId, checkinId) => {
  const result = await checkinRepository.markOwnerCheckOut(
    ownerId,
    checkinId
  );

  if (result.affectedRows === 0) {
    throw new Error("Check-in not found or already checked out");
  }

  return {
    message: "Guest checked out successfully. Room is available again.",
  };
};

module.exports = {
  getOwnerBookingForCheckIn,
  ownerCheckIn,
  getOwnerCheckInHistory,
  getPropertyCheckIns,
  initiateCheckIn,
  confirmCheckIn,
  recordCheckIn,
  getPendingCheckInsOwner,
  getPendingCheckInsAdmin,
  getCommissionsForAdmin,
  getCommissionSummaryData,
  getOwnerCommissions,
  getOwnerCommissionSummary,
  payCommission,
  ownerCheckOut,
};
