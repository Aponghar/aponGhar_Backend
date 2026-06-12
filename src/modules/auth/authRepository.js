const pool = require("../../config/db");



const findUserByEmail = async (email) => {

    const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
};

const findUserById = async (id) => {

    const [rows] = await pool.query(
        "SELECT id, full_name, email, phone, role, is_verified, commission_percentage FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
};

const createUser = async (userData) => {

    const { full_name, email, phone, password } = userData;

    const [result] = await pool.query(

        `INSERT INTO users 
        (full_name, email, phone, password)
        VALUES (?, ?, ?, ?)`,

        [full_name, email, phone, password]
    );

    return result;
};

const createOTPRecord = async (
    userId,
    otpCode,
    expiresAt
) => {

    await pool.query(

        `INSERT INTO otp_verifications
        (user_id, otp_code, expires_at)
        VALUES (?, ?, ?)`,

        [userId, otpCode, expiresAt]
    );
};



const findValidOTP = async (
    userId,
    otpCode
) => {

    const [rows] = await pool.query(

        `SELECT * FROM otp_verifications
        WHERE user_id = ?
        AND otp_code = ?
        AND is_used = FALSE
        AND expires_at > NOW()`,

        [userId, otpCode]
    );

    return rows[0];
};



const markOTPUsed = async (otpId) => {

    await pool.query(

        `UPDATE otp_verifications
        SET is_used = TRUE
        WHERE id = ?`,

        [otpId]
    );
};



const verifyUser = async (userId) => {

    await pool.query(

        `UPDATE users
        SET is_verified = TRUE
        WHERE id = ?`,

        [userId]
    );
};

const createPasswordResetToken = async (
    userId,
    resetToken,
    expiresAt
) => {

    await pool.query(

        `INSERT INTO password_resets
        (user_id, reset_token, expires_at)
        VALUES (?, ?, ?)`,

        [userId, resetToken, expiresAt]
    );
};

const findValidResetToken = async (
    token
) => {

    const [rows] = await pool.query(

        `SELECT * FROM password_resets
        WHERE reset_token = ?
        AND is_used = FALSE
        AND expires_at > NOW()`,

        [token]
    );

    return rows[0];
};

const markResetTokenUsed = async (
    tokenId
) => {

    await pool.query(

        `UPDATE password_resets
        SET is_used = TRUE
        WHERE id = ?`,

        [tokenId]
    );
};

const updateUserPassword = async (
    userId,
    hashedPassword
) => {

    await pool.query(

        `UPDATE users
        SET password = ?
        WHERE id = ?`,

        [hashedPassword, userId]
    );
};



module.exports = {
    findUserByEmail,
    createUser,
    findUserById,
    createOTPRecord,
    findValidOTP,
    markOTPUsed,
    verifyUser,
    createPasswordResetToken,
    findValidResetToken,
    markResetTokenUsed,
    updateUserPassword
};
