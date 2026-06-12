const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../config/multer");
const resizeImages = require("../../middleware/imageResizeMiddleware");
const cloudinaryUpload = require("../../middleware/cloudinaryUploadMiddleware");

const {
  createAd,
  getActiveAds,
  getAllAds,
  deleteAd
} = require("./adController");

// PUBLIC: Get active banners
router.get("/", getActiveAds);

// ADMIN: Get all banners (including inactive ones if they exist, or just all)
router.get("/all", authMiddleware, roleMiddleware("ADMIN"), getAllAds);

// ADMIN: Upload new banner (multipart/form-data)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  upload.single("ad_image"),
  resizeImages,
  cloudinaryUpload,
  createAd
);

// ADMIN: Delete banner
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteAd);

module.exports = router;
