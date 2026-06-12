const pool = require("../../config/db");

const createAd = async (adData) => {
  const { image_url, redirect_url } = adData;
  const [result] = await pool.query(
    "INSERT INTO advertisements (image_url, redirect_url) VALUES (?, ?)",
    [image_url, redirect_url]
  );
  return result;
};

const getActiveAds = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM advertisements WHERE is_active = 1 ORDER BY created_at DESC"
  );
  return rows;
};

const getAllAds = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM advertisements ORDER BY created_at DESC"
  );
  return rows;
};

const deleteAd = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM advertisements WHERE id = ?",
    [id]
  );
  return result;
};

module.exports = {
  createAd,
  getActiveAds,
  getAllAds,
  deleteAd
};
