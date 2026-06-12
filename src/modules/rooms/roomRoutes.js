const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const upload = require("../../config/multer");
const resizeImages = require("../../middleware/imageResizeMiddleware");
const cloudinaryUpload = require("../../middleware/cloudinaryUploadMiddleware");

const {
    createRoom,
    createBulkRooms,
    getRooms,
    uploadRoomImages,
    getRoomGallery,
    updateRoom,
    deleteRoom,
    generateInventory,
    getInventory,
    lockInventory,
    releaseInventory,
    getAmenities,
    getAvailableRoomsByProperty,
    getOwnerRoomManagement
} = require("./roomController");

// Get amenities (public)
router.get("/amenities/list", getAmenities);

// Get available rooms by property (deduplicated by type)
router.get("/property/:propertyId/available", getAvailableRoomsByProperty);

router.get(
    "/owner/management",
    authMiddleware,
    roleMiddleware("OWNER"),
    getOwnerRoomManagement
);

// Create single room
router.post(
    "/property/:propertyId",
    authMiddleware,
    roleMiddleware("OWNER"),
    createRoom
);

// Create bulk rooms
router.post(
    "/property/:propertyId/bulk",
    authMiddleware,
    roleMiddleware("OWNER"),
    createBulkRooms
);

// Get property rooms
router.get("/property/:propertyId", getRooms);

// Update room
router.put(
    "/:roomId",
    authMiddleware,
    roleMiddleware("OWNER"),
    updateRoom
);

// Delete room (soft delete)
router.delete(
    "/:roomId",
    authMiddleware,
    roleMiddleware("OWNER"),
    deleteRoom
);

// Upload room images
router.post(
    "/:roomId/images",
    authMiddleware,
    roleMiddleware("OWNER"),
    upload.array("images", 10),
    resizeImages,
    cloudinaryUpload,
    uploadRoomImages
);

// Get room gallery
router.get("/:roomId/gallery", getRoomGallery);

// Generate room inventory
router.post(
    "/:roomId/inventory",
    authMiddleware,
    roleMiddleware("OWNER"),
    generateInventory
);

// Lock room inventory
router.post(
    "/:roomId/inventory/lock",
    authMiddleware,
    roleMiddleware("OWNER"),
    lockInventory
);

// Release room inventory
router.post(
    "/:roomId/inventory/release",
    authMiddleware,
    roleMiddleware("OWNER"),
    releaseInventory
);

// Get room inventory
router.get("/:roomId/inventory", getInventory);

module.exports = router;
