const pool = require("../../config/db");

const getUserProfile = async (userId) => {
    const [rows] = await pool.query(
        "SELECT id, full_name, email, phone, role, is_verified, created_at FROM users WHERE id = ?",
        [userId]
    );
    return rows[0];
};

const updateUserProfile = async (userId, { full_name, email, phone }) => {
    await pool.query(
        "UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?",
        [full_name, email, phone, userId]
    );
};

const getUserPassword = async (userId) => {
    const [rows] = await pool.query(
        "SELECT password FROM users WHERE id = ?",
        [userId]
    );
    return rows[0]?.password;
};

const updateUserPassword = async (userId, hashedPassword) => {
    await pool.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId]
    );
};

const hasActiveBookings = async (userId) => {
    const [userBookings] = await pool.query(
        `SELECT id FROM bookings 
         WHERE user_id = ? 
           AND booking_status IN ('PENDING', 'CONFIRMED') 
           AND check_out_date >= CURDATE()
         LIMIT 1`,
        [userId]
    );
    if (userBookings.length > 0) return true;

    // Check if user is host with upcoming guest bookings
    const [hostBookings] = await pool.query(
        `SELECT b.id FROM bookings b
         JOIN rooms r ON b.room_id = r.id
         JOIN properties p ON r.property_id = p.id
         WHERE p.owner_id = ?
           AND b.booking_status IN ('PENDING', 'CONFIRMED')
           AND b.check_out_date >= CURDATE()
         LIMIT 1`,
        [userId]
    );
    return hostBookings.length > 0;
};

const deleteUserAccount = async (userId) => {
    const scrambledEmail = `deleted_${userId}_${Date.now()}@deleted.aponghar.in`;
    await pool.query(
        `UPDATE users 
         SET full_name = 'Deleted User',
             email = ?,
             phone = NULL,
             password = 'DELETED_ACCOUNT',
             is_active = 0
         WHERE id = ?`,
        [scrambledEmail, userId]
    );
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserPassword,
    updateUserPassword,
    hasActiveBookings,
    deleteUserAccount
};
