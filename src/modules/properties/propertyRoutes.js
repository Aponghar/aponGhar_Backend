const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const upload =
    require("../../config/multer");

const resizeImages =
    require("../../middleware/imageResizeMiddleware");

const cloudinaryUpload =
    require("../../middleware/cloudinaryUploadMiddleware");

const {

    createProperty,

    getMyProperties,

    uploadImages,

    getGallery,

    updateProperty,

    deleteProperty,

    addAmenities,

    getAmenities,

    getAllAmenities,

    addRules,

    getRules,

    updateRule,

    searchRooms,

    getFeaturedProperties,

    getTrendingProperties,

    getTopRatedProperties,

    getPropertyDetails,

    getAllProperties

} = require("./propertyController");


// GET ALL PUBLIC PROPERTIES
router.get(
    "/",
    getAllProperties
);

// CREATE PROPERTY
router.post(

    "/",

    authMiddleware,

    roleMiddleware("OWNER"),

    upload.single("property_image"),

    resizeImages,

    cloudinaryUpload,

    createProperty
);



// GET MY PROPERTIES
router.get(

    "/my-properties",

    authMiddleware,

    roleMiddleware("OWNER"),

    getMyProperties
);



// UPDATE PROPERTY
router.put(

    "/:propertyId",

    authMiddleware,

    roleMiddleware("OWNER"),

    updateProperty
);



// SOFT DELETE PROPERTY
router.delete(

    "/:propertyId",

    authMiddleware,

    roleMiddleware("OWNER"),

    deleteProperty
);



// UPLOAD PROPERTY IMAGES
router.post(

    "/:propertyId/images",

    authMiddleware,

    roleMiddleware("OWNER"),

    upload.array("images", 10),

    resizeImages,

    cloudinaryUpload,

    uploadImages
);

// GET SINGLE PROPERTY DETAILS
router.get(

    "/:propertyId",

    getPropertyDetails
);

// GET PROPERTY GALLERY
router.get(

    "/:propertyId/gallery",

    getGallery
);


// GET ALL AMENITIES
router.get(
    "/amenities/all",
    getAllAmenities
);



// ADD AMENITIES TO PROPERTY
router.post(

    "/:propertyId/amenities",

    authMiddleware,

    roleMiddleware("OWNER"),

    addAmenities
);



// GET PROPERTY AMENITIES
router.get(

    "/:propertyId/amenities",

    getAmenities
);

// ADD PROPERTY RULES
router.post(

    "/:propertyId/rules",

    authMiddleware,

    roleMiddleware("OWNER"),

    addRules
);

// GET PROPERTY RULES
router.get(

    "/:propertyId/rules",

    getRules
);

// UPDATE PROPERTY RULE
router.put(

    "/:propertyId/rules/:ruleId",

    authMiddleware,

    roleMiddleware("OWNER"),

    updateRule
);

// PUBLIC SEARCH API
router.get(

    "/search/rooms",

    searchRooms
);

// FEATURED PROPERTIES
router.get(

    "/featured",

    getFeaturedProperties
);

// TRENDING PROPERTIES
router.get(

    "/trending",

    getTrendingProperties
);

// TOP RATED PROPERTIES
// TOP RATED PROPERTIES
router.get(

    "/top-rated",

    getTopRatedProperties
);

module.exports = router;