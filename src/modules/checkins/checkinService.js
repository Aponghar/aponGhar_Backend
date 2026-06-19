const checkinRepository = require("./checkinRepository");
const {
  deriveIncludedCommission,
  toMoney,
} = require("../../utils/pricing");

const formatDateOnly = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  if (booking.payment_method === "OFFLINE") {
    try {
      const bookingRepository = require("../bookings/bookingRepository");
      await bookingRepository.updateBookingStatus(
        booking.id,
        booking.booking_status,
        "PAID"
      );
    } catch (err) {
      console.error(
        "Failed to update booking payment status to PAID for offline booking:",
        err.message
      );
    }
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
  const checkIn = await checkinRepository.getCheckInById(checkinId);
  if (!checkIn) {
    throw new Error("Check-in not found");
  }

  const result = await checkinRepository.markOwnerCheckOut(
    ownerId,
    checkinId
  );

  if (result.affectedRows === 0) {
    throw new Error("Check-in not found or already checked out");
  }

  // Automatically unlock the earning on check-out if still pending
  try {
    const financeService = require("../finance/financeService");
    await financeService.unlockOwnerEarning(checkIn.booking_id);
  } catch (err) {
    console.error("Failed to unlock owner earning on checkout:", err.message);
  }

  // Release room inventory on checkout
  try {
    const bookingRepository = require("../bookings/bookingRepository");
    const booking = await bookingRepository.getBookingById(checkIn.booking_id);
    if (booking) {
      const roomService = require("../rooms/roomService");
      const checkinDate = new Date(booking.check_in_date);
      checkinDate.setHours(0, 0, 0, 0);

      // For hourly bookings on the same day, inventory end date is check_in + 1 day
      let inventoryEndDate;
      if (
        booking.booking_type === "HOURLY" &&
        formatDateOnly(booking.check_in_date) ===
          formatDateOnly(booking.check_out_date)
      ) {
        inventoryEndDate = formatDateOnly(
          new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000)
        );
      } else {
        inventoryEndDate = formatDateOnly(booking.check_out_date);
      }

      await roomService.releaseRoomInventory(
        booking.room_id,
        formatDateOnly(booking.check_in_date),
        inventoryEndDate,
        booking.booked_rooms || 1
      );
    }
  } catch (err) {
    console.error("Failed to release room inventory on checkout:", err.message);
  }

  return {
    message: "Guest checked out successfully. Room is available again.",
  };
};

const ownerManualCheckIn = async (ownerId, checkInData) => {
  const {
    assigned_room_id,
    guest_name,
    guest_email,
    guest_phone,
    check_in_date,
    check_out_date,
    guests
  } = checkInData;

  const pool = require("../../config/db");
  const bookingRepository = require("../bookings/bookingRepository");
  const roomService = require("../rooms/roomService");

  // 1. Verify room ownership
  const [rooms] = await pool.query(
    `SELECT r.*, p.id AS property_id, p.owner_id
     FROM room r
     JOIN properties p ON r.property_id = p.id
     WHERE r.id = ? AND p.owner_id = ? AND r.is_active = TRUE AND p.is_active = TRUE AND p.approval_status = 'APPROVED'`,
    [assigned_room_id, ownerId]
  );
  const room = rooms[0];
  if (!room) {
    const error = new Error("Room not found, unauthorized, or property is inactive");
    error.statusCode = 404;
    throw error;
  }

  const checkIn = new Date(check_in_date);
  const checkOut = new Date(check_out_date);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    const error = new Error("Invalid check-in or check-out date");
    error.statusCode = 400;
    throw error;
  }
  if (checkIn >= checkOut) {
    const error = new Error("Check-out date must be after check-in date");
    error.statusCode = 400;
    throw error;
  }

  const formattedCheckIn = formatDateOnly(check_in_date);
  const formattedCheckOut = formatDateOnly(check_out_date);

  // 2. Check overlap for specific physical room
  const [overlaps] = await pool.query(
    `SELECT ci.id
     FROM check_ins ci
     JOIN bookings b ON ci.booking_id = b.id
     WHERE ci.assigned_room_id = ?
       AND ci.status != 'CANCELLED'
       AND ci.checked_out_at IS NULL
       AND b.check_in_date < ?
       AND b.check_out_date > ?`,
    [assigned_room_id, formattedCheckOut, formattedCheckIn]
  );
  if (overlaps.length > 0) {
    const error = new Error("This room is already occupied or booked for the selected dates");
    error.statusCode = 409;
    throw error;
  }

  // 3. Lock room inventory
  await roomService.lockRoomInventory(
    room.id,
    formattedCheckIn,
    formattedCheckOut,
    1
  );

  // 4. Create booking record
  const bookingCode = 'MANUAL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
  const specialRequests = `Manual walk-in booking.${guest_phone ? ` Contact: ${guest_phone}` : ''}`;

  const bookingResult = await bookingRepository.createBooking({
    booking_code: bookingCode,
    user_id: ownerId,
    room_id: room.id,
    property_id: room.property_id,
    booking_type: 'NIGHTLY',
    pricing_option: 'PER_NIGHT',
    check_in_date: formattedCheckIn,
    check_in_time: '12:00:00',
    check_out_date: formattedCheckOut,
    check_out_time: '11:00:00',
    guests: guests || 1,
    booked_rooms: 1,
    guest_name: guest_name,
    guest_email: guest_email || null,
    guest_age: 30, // placeholder age
    customer_name: guest_name,
    total_amount: 0.00,
    booking_base_amount: 0.00,
    booking_commission_percentage: 0.00,
    booking_commission_amount: 0.00,
    booking_unit_base_price: 0.00,
    booking_unit_selling_price: 0.00,
    coupon_id: null,
    coupon_discount: 0.00,
    wallet_used: 0.00,
    gateway_paid: 0.00,
    payment_method: 'OFFLINE',
    special_requests: specialRequests
  });

  const bookingId = bookingResult.insertId;

  // Confirm booking
  await bookingRepository.updateBookingStatus(bookingId, 'CONFIRMED', 'PAID');

  // 5. Create check-in
  const checkInResult = await checkinRepository.createCheckIn({
    booking_id: bookingId,
    user_id: ownerId,
    owner_id: ownerId,
    property_id: room.property_id,
    room_id: room.id,
    assigned_room_id: assigned_room_id,
    booking_amount: 0.00,
    commission_percentage: 0.00,
    commission_amount: 0.00
  });

  return {
    message: "Room manually marked as occupied",
    booking_code: bookingCode,
    checkin_id: checkInResult.insertId
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
  ownerManualCheckIn,
};
