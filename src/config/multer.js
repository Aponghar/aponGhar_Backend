const multer = require("multer");

const path = require("path");

const fs = require("fs");



// STORAGE CONFIG
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        // DEFAULT UPLOAD PATH
        let uploadPath = "uploads/";

        // OWNER DOCUMENTS
        if (
            req.baseUrl.includes("owners")
        ) {

            uploadPath += "owners/";
        }

        // PROPERTY IMAGES
        else if (
            req.baseUrl.includes("properties")
        ) {

            uploadPath += "properties/";
        }

        // ROOM IMAGES
        else if (
            req.baseUrl.includes("rooms")
        ) {

            uploadPath += "rooms/";
        }

        // REVIEW IMAGES
        else if (
            req.baseUrl.includes("reviews")
        ) {

            uploadPath += "reviews/";
        }

        fs.mkdirSync(uploadPath, {
            recursive: true
        });

        cb(null, uploadPath);
    },



    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9);

        cb(
            null,

            uniqueName +
            path.extname(file.originalname)
        );
    }
});



// FILE FILTER
const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    const reviewMimeTypes = [

        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const effectiveMimeTypes =
        req.baseUrl.includes("reviews")
            ? reviewMimeTypes
            : allowedMimeTypes;

    if (
        effectiveMimeTypes.includes(file.mimetype)
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Invalid file type"
            ),
            false
        );
    }
};



// MULTER INSTANCE
const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024
    }
});



module.exports = upload;
