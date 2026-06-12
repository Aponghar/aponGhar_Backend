const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const {
    applyForOwner,
    getApplications,
    approveApplication,
    rejectApplication

} = require("./ownerController");

const upload =
    require("../../config/multer");

const cloudinaryUpload =
    require("../../middleware/cloudinaryUploadMiddleware");

// USER APPLY
router.post(
    "/apply",

    authMiddleware,

    roleMiddleware("USER"),

    applyForOwner
);



// ADMIN GET ALL APPLICATIONS
router.get(
    "/applications",

    authMiddleware,

    roleMiddleware("ADMIN"),

    getApplications
);



// ADMIN APPROVE
router.put(
    "/applications/:id/approve",

    authMiddleware,

    roleMiddleware("ADMIN"),

    approveApplication
);



// ADMIN REJECT
router.put(
    "/applications/:id/reject",

    authMiddleware,

    roleMiddleware("ADMIN"),

    rejectApplication
);

router.post(

    "/upload-document",

    authMiddleware,

    roleMiddleware("USER", "OWNER"),

    upload.single("document"),

    cloudinaryUpload,

    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "Document uploaded successfully",

            file: req.file
        });
    }
);

module.exports = router;