const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const { getWishlist, getWishlistIds, toggleWishlist } = require("./wishlistController");

router.get("/", authMiddleware, getWishlist);
router.get("/ids", authMiddleware, getWishlistIds);
router.post("/toggle", authMiddleware, toggleWishlist);

module.exports = router;
