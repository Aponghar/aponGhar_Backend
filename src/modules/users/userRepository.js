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

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserPassword,
    updateUserPassword
};
