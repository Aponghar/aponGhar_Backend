const pool = require("../../config/db");

const CHECK_IN_SELECT = `
  SELECT
    ci.id,
    ci.booking_id,
    ci.user_id,
    ci.owner_id,
    ci.property_id,
    ci.room_id,
    ci.assigned_room_id,
    ci.booking_amount,
    ci.commission_percentage,
    ci.commission_amount,
    ci.status,
    ci.user_checkin_at,
    ci.owner_confirmed_at,
    ci.admin_recorded_at,
    ci.checked_out_at,
    ac.id AS commission_id,
    ac.payment_status AS commission_payment_status,
    ac.payment_method,
    ac.payment_notes,
    ac.payment_requested_at,
    ac.payment_confirmed_at,
    ac.payment_proof_notes,
    ac.razorpay_order_id,
    ac.razorpay_payment_id,
    ac.razorpay_payment_status,
    ac.razorpay_failure_reason,
    u.email AS user_email,
    u.phone AS user_phone,
    o.email AS owner_email,
    o.full_name AS owner_name,
    b.guest_name,
    b.guest_email,
    b.customer_name,
    b.booking_code,
    b.check_in_date,
    b.check_in_time,
    b.check_out_date,
    b.check_out_time,
    b.guests,
    b.booked_rooms,
    b.booking_type,
    b.pricing_option,
    b.special_requests,
    COALESCE(b.booking_base_amount, ci.booking_amount - ci.commission_amount) AS booking_base_amount,
    b.booking_commission_amount,
    b.booking_unit_base_price,
    b.booking_unit_selling_price,
    p.property_name,
    r.room_name,
    r.room_type,
    ar.room_id AS assigned_room_code,
    ar.room_name AS assigned_room_name,
    ar.room_type AS assigned_room_type
  FROM check_ins ci
  JOIN users u ON ci.user_id = u.id
  JOIN users o ON ci.owner_id = o.id
  JOIN bookings b ON ci.booking_id = b.id
  JOIN properties p ON ci.property_id = p.id
  JOIN room r ON ci.room_id = r.id
  LEFT JOIN room ar ON ci.assigned_room_id = ar.id
  LEFT JOIN admin_commissions ac ON ac.checkin_id = ci.id
`;

const findBookingByCode = async (bookingCode, ownerId) => {
  const [bookings] = await pool.query(
    `SELECT
      b.id,
      b.booking_code,
      b.user_id,
      b.property_id,
      b.room_id,
      b.booking_status,
      b.payment_status,
      b.payment_method,
      b.total_amount,
      b.booking_base_amount,
      b.booking_commission_percentage,
      b.booking_commission_amount,
      b.booking_unit_base_price,
      b.booking_unit_selling_price,
      b.check_in_date,
      b.check_in_time,
      b.check_out_date,
      b.check_out_time,
      b.guests,
      b.booked_rooms,
      b.guest_name,
      b.guest_email,
      b.guest_age,
      b.customer_name,
      b.booking_type,
      b.pricing_option,
      b.special_requests,
      u.full_name AS user_full_name,
      u.email AS user_email,
      u.phone AS user_phone,
      p.owner_id,
      p.property_name,
      p.commission_percentage,
      r.room_name,
      r.room_type
    FROM bookings b
    JOIN properties p ON b.property_id = p.id
    JOIN room r ON b.room_id = r.id
    JOIN users u ON b.user_id = u.id
    WHERE UPPER(b.booking_code) = UPPER(?)
      AND p.owner_id = ?
    LIMIT 1`,
    [bookingCode, ownerId]
  );

  return bookings[0];
};

const getOccupiedRoomCondition = () => `
  assigned_ci.id IS NULL
`;

const getAvailableAssignedRoomsForBooking = async (ownerId, booking) => {
  const [rooms] = await pool.query(
    `SELECT
      candidate.id,
      candidate.room_id,
      candidate.room_name,
      candidate.room_type,
      candidate.bed_type,
      candidate.room_size
    FROM room booked_room
    JOIN room candidate
      ON candidate.property_id = booked_room.property_id
      AND candidate.room_type = booked_room.room_type
      AND candidate.is_active = TRUE
    JOIN properties p
      ON candidate.property_id = p.id
      AND p.owner_id = ?
      AND p.is_active = TRUE
      AND p.approval_status = 'APPROVED'
    LEFT JOIN (
      SELECT active_ci.id, active_ci.assigned_room_id
      FROM check_ins active_ci
      JOIN bookings active_booking
        ON active_ci.booking_id = active_booking.id
      WHERE active_ci.status != 'CANCELLED'
        AND active_ci.checked_out_at IS NULL
        AND TIMESTAMP(
          active_booking.check_out_date,
          COALESCE(active_booking.check_out_time, '23:59:59')
        ) >= NOW()
    ) assigned_ci
      ON assigned_ci.assigned_room_id = candidate.id
    WHERE booked_room.id = ?
      AND ${getOccupiedRoomCondition()}
    ORDER BY candidate.room_id ASC`,
    [ownerId, booking.room_id]
  );

  return rooms;
};

const getAssignableRoomForBooking = async (
  ownerId,
  booking,
  assignedRoomId
) => {
  const [rooms] = await pool.query(
    `SELECT
      candidate.id,
      candidate.room_id,
      candidate.room_name,
      candidate.room_type
    FROM room booked_room
    JOIN room candidate
      ON candidate.property_id = booked_room.property_id
      AND candidate.room_type = booked_room.room_type
      AND candidate.is_active = TRUE
    JOIN properties p
      ON candidate.property_id = p.id
      AND p.owner_id = ?
      AND p.is_active = TRUE
      AND p.approval_status = 'APPROVED'
    LEFT JOIN (
      SELECT active_ci.id, active_ci.assigned_room_id
      FROM check_ins active_ci
      JOIN bookings active_booking
        ON active_ci.booking_id = active_booking.id
      WHERE active_ci.status != 'CANCELLED'
        AND active_ci.checked_out_at IS NULL
        AND TIMESTAMP(
          active_booking.check_out_date,
          COALESCE(active_booking.check_out_time, '23:59:59')
        ) >= NOW()
    ) assigned_ci
      ON assigned_ci.assigned_room_id = candidate.id
    WHERE booked_room.id = ?
      AND candidate.id = ?
      AND ${getOccupiedRoomCondition()}
    LIMIT 1`,
    [ownerId, booking.room_id, assignedRoomId]
  );

  return rooms[0];
};

const getCheckInByBookingId = async (bookingId) => {
  const [checkIns] = await pool.query(
    `SELECT * FROM check_ins
    WHERE booking_id = ?
      AND status != 'CANCELLED'
    LIMIT 1`,
    [bookingId]
  );

  return checkIns[0];
};

const createCheckIn = async (checkInData) => {
  const {
    booking_id,
    user_id,
    owner_id,
    property_id,
    room_id,
    assigned_room_id,
    booking_amount,
    commission_percentage,
    commission_amount,
  } = checkInData;

  const [result] = await pool.query(
    `INSERT INTO check_ins (
      booking_id,
      user_id,
      owner_id,
      property_id,
      room_id,
      assigned_room_id,
      booking_amount,
      commission_percentage,
      commission_amount,
      status,
      owner_confirmed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OWNER_CONFIRMED', NOW())`,
    [
      booking_id,
      user_id,
      owner_id,
      property_id,
      room_id,
      assigned_room_id,
      booking_amount,
      commission_percentage,
      commission_amount,
    ]
  );

  return result;
};

const getAllCheckInsForOwner = async (ownerId) => {
  const [checkIns] = await pool.query(
    `${CHECK_IN_SELECT}
    WHERE ci.owner_id = ?
    ORDER BY COALESCE(ci.owner_confirmed_at, ci.user_checkin_at) DESC`,
    [ownerId]
  );

  return checkIns;
};

const getCheckInsByProperty = async (propertyId, ownerId) => {
  const [checkIns] = await pool.query(
    `${CHECK_IN_SELECT}
    WHERE ci.property_id = ?
      AND ci.owner_id = ?
    ORDER BY COALESCE(ci.owner_confirmed_at, ci.user_checkin_at) DESC`,
    [propertyId, ownerId]
  );

  return checkIns;
};

const getPendingCheckInsForOwner = async (ownerId) => {
  const [checkIns] = await pool.query(
    `${CHECK_IN_SELECT}
    WHERE ci.owner_id = ?
      AND ci.status = 'USER_REQUEST'
    ORDER BY ci.user_checkin_at DESC`,
    [ownerId]
  );

  return checkIns;
};

const getPendingCheckInsForAdmin = async () => {
  const [checkIns] = await pool.query(
    `${CHECK_IN_SELECT}
    WHERE ci.status IN ('OWNER_CONFIRMED')
    ORDER BY COALESCE(ci.owner_confirmed_at, ci.user_checkin_at) DESC`
  );

  return checkIns;
};

const confirmCheckInByOwner = async (checkInId, ownerId) => {
  const [result] = await pool.query(
    `UPDATE check_ins
    SET status = 'OWNER_CONFIRMED',
        owner_confirmed_at = NOW()
    WHERE id = ?
      AND owner_id = ?
      AND status = 'USER_REQUEST'`,
    [checkInId, ownerId]
  );

  return result;
};

const recordCheckInByAdmin = async (checkInId) => {
  const [result] = await pool.query(
    `UPDATE check_ins
    SET status = 'ADMIN_RECORDED',
        admin_recorded_at = NOW()
    WHERE id = ? AND status = 'OWNER_CONFIRMED'`,
    [checkInId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Check-in not found or not in correct status");
  }

  const [checkIns] = await pool.query(
    `SELECT * FROM check_ins WHERE id = ?`,
    [checkInId]
  );

  const checkIn = checkIns[0];

  const [bookings] = await pool.query(
    `SELECT payment_method, payment_status FROM bookings WHERE id = ?`,
    [checkIn.booking_id]
  );
  const booking = bookings[0];
  const isOnlinePaid = booking && booking.payment_method !== 'OFFLINE' && booking.payment_status === 'PAID';

  await pool.query(
    `INSERT INTO admin_commissions (
      checkin_id,
      booking_id,
      property_id,
      owner_id,
      commission_amount,
      payment_status,
      paid_at,
      payment_confirmed_at,
      payment_method,
      payment_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      checkInId,
      checkIn.booking_id,
      checkIn.property_id,
      checkIn.owner_id,
      checkIn.commission_amount,
      isOnlinePaid ? 'PAID' : 'PENDING',
      isOnlinePaid ? new Date() : null,
      isOnlinePaid ? new Date() : null,
      isOnlinePaid ? 'ONLINE_DEDUCTION' : null,
      isOnlinePaid ? 'Automatically paid via online booking deduction' : null,
    ]
  );

  return result;
};

const buildCommissionFilters = (filters = {}) => {
  const where = [];
  const params = [];
  const status = filters.status
    ? String(filters.status).trim().toUpperCase()
    : "";
  const requestState = filters.requestState
    ? String(filters.requestState).trim().toUpperCase()
    : "";

  if (filters.propertyId) {
    where.push("ac.property_id = ?");
    params.push(filters.propertyId);
  }

  if (filters.ownerId) {
    where.push("ac.owner_id = ?");
    params.push(filters.ownerId);
  }

  if (filters.from) {
    where.push("ac.earned_at >= ?");
    params.push(`${filters.from} 00:00:00`);
  }

  if (filters.to) {
    where.push("ac.earned_at <= ?");
    params.push(`${filters.to} 23:59:59`);
  }

  if (status) {
    where.push("ac.payment_status = ?");
    params.push(status);
  }

  if (requestState === "REQUESTED") {
    where.push("ac.payment_requested_at IS NOT NULL");
    where.push("ac.payment_status = 'PENDING'");
  }

  if (requestState === "UNREQUESTED") {
    where.push("ac.payment_requested_at IS NULL");
    where.push("ac.payment_status = 'PENDING'");
  }

  return {
    clause: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
};

const getCommissionsForAdmin = async (filters = {}) => {
  const { clause, params } = buildCommissionFilters(filters);

  const [commissions] = await pool.query(
    `SELECT
      ac.id,
      ac.checkin_id,
      ac.booking_id,
      ac.property_id,
      ac.owner_id,
      ac.commission_amount,
      ac.payment_status,
      ac.earned_at,
      ac.paid_at,
      ac.payment_method,
      ac.payment_notes,
      ac.payment_requested_at,
      ac.payment_confirmed_at,
      ac.payment_proof_notes,
      ac.razorpay_order_id,
      ac.razorpay_payment_id,
      ac.razorpay_payment_status,
      ac.razorpay_failure_reason,
      o.email as owner_email,
      o.full_name as owner_name,
      p.property_name,
      b.guest_name,
      b.booking_code,
      b.total_amount AS booking_total_amount,
      COALESCE(b.booking_base_amount, b.total_amount - ac.commission_amount) AS booking_base_amount,
      b.booking_commission_percentage,
      b.booking_commission_amount
    FROM admin_commissions ac
    JOIN users o ON ac.owner_id = o.id
    JOIN properties p ON ac.property_id = p.id
    JOIN bookings b ON ac.booking_id = b.id
    ${clause}
    ORDER BY ac.earned_at DESC`,
    params
  );

  return commissions;
};

const getCommissionSummary = async (filters = {}) => {
  const { clause, params } = buildCommissionFilters(filters);

  const [summary] = await pool.query(
    `SELECT
      COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as total_pending_commissions,
      SUM(CASE WHEN payment_status = 'PENDING' THEN commission_amount ELSE 0 END) as total_pending_amount,
      COUNT(CASE WHEN payment_status = 'PENDING' AND payment_requested_at IS NULL THEN 1 END) as total_unrequested_commissions,
      SUM(CASE WHEN payment_status = 'PENDING' AND payment_requested_at IS NULL THEN commission_amount ELSE 0 END) as total_unrequested_amount,
      COUNT(CASE WHEN payment_status = 'PENDING' AND payment_requested_at IS NOT NULL THEN 1 END) as total_requested_commissions,
      SUM(CASE WHEN payment_status = 'PENDING' AND payment_requested_at IS NOT NULL THEN commission_amount ELSE 0 END) as total_requested_amount,
      COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as total_paid_commissions,
      SUM(CASE WHEN payment_status = 'PAID' THEN commission_amount ELSE 0 END) as total_paid_amount,
      COUNT(*) as total_commissions,
      SUM(commission_amount) as total_commission_amount
    FROM admin_commissions ac
    ${clause}`,
    params
  );

  return summary[0];
};

const getCheckInById = async (checkInId) => {
  const [checkIns] = await pool.query(
    `SELECT * FROM check_ins WHERE id = ?`,
    [checkInId]
  );

  return checkIns[0];
};

const markOwnerCheckOut = async (ownerId, checkInId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE check_ins
      SET checked_out_at = NOW()
      WHERE id = ?
        AND owner_id = ?
        AND status != 'CANCELLED'
        AND checked_out_at IS NULL`,
      [checkInId, ownerId]
    );

    if (result.affectedRows > 0) {
      await connection.query(
        `UPDATE bookings b
        JOIN check_ins ci ON ci.booking_id = b.id
        SET b.booking_status = 'COMPLETED'
        WHERE ci.id = ?`,
        [checkInId]
      );
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getCommissionsForOwner = async (ownerId, filters = {}) => {
  return getCommissionsForAdmin({ ...filters, ownerId });
};

const getCommissionSummaryForOwner = async (ownerId, filters = {}) => {
  const summary = await getCommissionSummary({ ...filters, ownerId });
  const [overdue] = await pool.query(
    `SELECT
      COUNT(*) as total_overdue_commissions,
      SUM(commission_amount) as total_overdue_amount
    FROM admin_commissions ac
    WHERE owner_id = ?
      AND payment_status = 'PENDING'
      AND earned_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [ownerId]
  );

  return {
    ...summary,
    total_overdue_commissions: overdue[0].total_overdue_commissions || 0,
    total_overdue_amount: overdue[0].total_overdue_amount || 0
  };
};

const markCommissionPaidByOwner = async (commissionId, ownerId, paymentData) => {
  const { payment_method, payment_notes } = paymentData;
  const [result] = await pool.query(
    `UPDATE admin_commissions
    SET payment_status = 'PAID',
        paid_at = NOW(),
        payment_confirmed_at = NOW(),
        payment_method = ?,
        payment_notes = ?,
        payment_proof_notes = ?
    WHERE id = ? AND owner_id = ? AND payment_status = 'PENDING'`,
    [payment_method, payment_notes, payment_notes, commissionId, ownerId]
  );
  return result;
};

const getCommissionForOwnerById = async (commissionId, ownerId) => {
  const [commissions] = await pool.query(
    `SELECT
      ac.*,
      o.email as owner_email,
      o.full_name as owner_name,
      p.property_name,
      b.booking_code
    FROM admin_commissions ac
    JOIN users o ON ac.owner_id = o.id
    JOIN properties p ON ac.property_id = p.id
    JOIN bookings b ON ac.booking_id = b.id
    WHERE ac.id = ?
      AND ac.owner_id = ?
    LIMIT 1`,
    [commissionId, ownerId]
  );

  return commissions[0];
};

const getCommissionByRazorpayOrderId = async (orderId, ownerId) => {
  const [commissions] = await pool.query(
    `SELECT
      ac.*,
      o.email as owner_email,
      o.full_name as owner_name,
      p.property_name,
      b.booking_code
    FROM admin_commissions ac
    JOIN users o ON ac.owner_id = o.id
    JOIN properties p ON ac.property_id = p.id
    JOIN bookings b ON ac.booking_id = b.id
    WHERE ac.razorpay_order_id = ?
      AND ac.owner_id = ?
    LIMIT 1`,
    [orderId, ownerId]
  );

  return commissions[0];
};

const attachCommissionRazorpayOrder = async (commissionId, ownerId, orderId) => {
  const [result] = await pool.query(
    `UPDATE admin_commissions
    SET razorpay_order_id = ?,
        razorpay_payment_status = 'CREATED',
        razorpay_failure_reason = NULL
    WHERE id = ?
      AND owner_id = ?
      AND payment_status = 'PENDING'`,
    [orderId, commissionId, ownerId]
  );

  return result;
};

const markCommissionRazorpayPaid = async (
  commissionId,
  ownerId,
  paymentData
) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    payment_method = "RAZORPAY",
  } = paymentData;

  const [result] = await pool.query(
    `UPDATE admin_commissions
    SET payment_status = 'PAID',
        paid_at = NOW(),
        payment_confirmed_at = NOW(),
        payment_method = ?,
        payment_notes = ?,
        payment_proof_notes = ?,
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        razorpay_payment_status = 'SUCCESS',
        razorpay_failure_reason = NULL
    WHERE id = ?
      AND owner_id = ?
      AND payment_status = 'PENDING'`,
    [
      payment_method,
      razorpay_payment_id,
      `Razorpay payment ${razorpay_payment_id}`,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      commissionId,
      ownerId,
    ]
  );

  return result;
};

const markCommissionRazorpayFailed = async (
  commissionId,
  ownerId,
  failureReason
) => {
  const [result] = await pool.query(
    `UPDATE admin_commissions
    SET razorpay_payment_status = 'FAILED',
        razorpay_failure_reason = ?
    WHERE id = ?
      AND owner_id = ?
      AND payment_status = 'PENDING'`,
    [failureReason, commissionId, ownerId]
  );

  return result;
};

module.exports = {
  findBookingByCode,
  getAvailableAssignedRoomsForBooking,
  getAssignableRoomForBooking,
  getCheckInByBookingId,
  createCheckIn,
  getAllCheckInsForOwner,
  getCheckInsByProperty,
  getPendingCheckInsForOwner,
  getPendingCheckInsForAdmin,
  confirmCheckInByOwner,
  recordCheckInByAdmin,
  getCommissionsForAdmin,
  getCommissionSummary,
  getCheckInById,
  markOwnerCheckOut,
  getCommissionsForOwner,
  getCommissionSummaryForOwner,
  markCommissionPaidByOwner,
  getCommissionForOwnerById,
  getCommissionByRazorpayOrderId,
  attachCommissionRazorpayOrder,
  markCommissionRazorpayPaid,
  markCommissionRazorpayFailed,
};
