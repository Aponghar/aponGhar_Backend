const pool = require("../../config/db");

const getWishlistByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT w.id AS wishlist_entry_id, p.*,
            (SELECT MIN(rp.base_price) FROM room_price rp WHERE rp.property_id = p.id) AS starting_price
         FROM wishlist w
         JOIN properties p ON w.property_id = p.id
         WHERE w.user_id = ? AND p.is_active = TRUE`,
        [userId]
    );
    return rows;
};

const getWishlistedPropertyIds = async (userId) => {
    const [rows] = await pool.query(
        `SELECT property_id FROM wishlist WHERE user_id = ?`,
        [userId]
    );
    return rows.map(r => r.property_id);
};

const checkWishlistExists = async (userId, propertyId) => {
    const [rows] = await pool.query(
        `SELECT id FROM wishlist WHERE user_id = ? AND property_id = ?`,
        [userId, propertyId]
    );
    return rows[0];
};

const addWishlistItem = async (userId, propertyId) => {
    await pool.query(
        `INSERT INTO wishlist (user_id, property_id) VALUES (?, ?)`,
        [userId, propertyId]
    );
};

const removeWishlistItem = async (userId, propertyId) => {
    await pool.query(
        `DELETE FROM wishlist WHERE user_id = ? AND property_id = ?`,
        [userId, propertyId]
    );
};

module.exports = {
    getWishlistByUserId,
    getWishlistedPropertyIds,
    checkWishlistExists,
    addWishlistItem,
    removeWishlistItem
};
