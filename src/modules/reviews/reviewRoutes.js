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

    createReview,

    getPropertyReviews,

    getReviewAnalytics,

    reportReview,

    moderateReview,

    respondToReview,

    getReviewResponses,

    getOwnerReviews

} = require("./reviewController");



// CREATE REVIEW
router.post(

    "/",

    authMiddleware,

    upload.array("photos", 5),

    resizeImages,

    cloudinaryUpload,

    createReview
);
router.get(

    "/property/:propertyId",

    getPropertyReviews
);

// REVIEW ANALYTICS
router.get(

    "/analytics/:propertyId",

    getReviewAnalytics
);

// REPORT REVIEW
router.post(

    "/report",

    authMiddleware,

    reportReview
);



// MODERATE REVIEW (ADMIN)
router.patch(

    "/moderate/:reviewId",

    authMiddleware,

    roleMiddleware("ADMIN"),

    moderateReview
);



// OWNER RESPONSE
router.get(

    "/owner/my-reviews",

    authMiddleware,

    roleMiddleware("OWNER"),

    getOwnerReviews
);

router.post(

    "/response/:reviewId",

    authMiddleware,

    roleMiddleware("OWNER"),

    respondToReview
);



// GET REVIEW RESPONSES
router.get(

    "/responses/:reviewId",

    getReviewResponses
);

module.exports = router;
