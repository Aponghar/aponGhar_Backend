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

router.get(
    "/documents/:filename",
    authMiddleware,
    roleMiddleware("ADMIN", "OWNER"),
    (req, res) => {
        const safeFilename = require("path").basename(req.params.filename);
        const filePath = require("path").join(__dirname, "../../../uploads/owners", safeFilename);

        if (!require("fs").existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        res.sendFile(filePath);
    }
);

module.exports = router;