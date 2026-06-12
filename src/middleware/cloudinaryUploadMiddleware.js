const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;

const cloudinaryUpload = async (req, res, next) => {
    // If no files uploaded, skip
    if (!req.file && (!req.files || req.files.length === 0)) {
        return next();
    }

    try {
        const uploadSingle = async (file) => {
            // Determine the subfolder based on route path
            let folderName = "general";
            const urlPath = req.baseUrl || "";

            if (urlPath.includes("owners")) {
                folderName = "owners";
            } else if (urlPath.includes("properties")) {
                folderName = "properties";
            } else if (urlPath.includes("rooms")) {
                folderName = "rooms";
            } else if (urlPath.includes("reviews")) {
                folderName = "reviews";
            } else if (urlPath.includes("advertisements") || urlPath.includes("banners")) {
                folderName = "banners";
            }

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `hotel_booking_system/${folderName}`,
                resource_type: "auto"
            });

            // Delete local temporary file
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error(`Failed to delete local temporary file ${file.path}:`, err);
            }

            // Update file details to use the secure Cloudinary URL
            file.path = result.secure_url;
            file.cloudinary_id = result.public_id;
        };

        if (req.file) {
            await uploadSingle(req.file);
        }

        if (req.files && req.files.length > 0) {
            await Promise.all(req.files.map(file => uploadSingle(file)));
        }

        next();
    } catch (error) {
        console.error("Cloudinary upload middleware error:", error);
        next(error);
    }
};

module.exports = cloudinaryUpload;
