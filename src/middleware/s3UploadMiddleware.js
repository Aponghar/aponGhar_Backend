const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, bucketName, region } = require("../config/s3");
const fs = require("fs").promises;
const path = require("path");

const s3Upload = async (req, res, next) => {
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

            const fileName = path.basename(file.path);
            const s3Key = `hotel_booking_system/${folderName}/${fileName}`;

            // Read the processed/optimized file
            const fileBuffer = await fs.readFile(file.path);

            // Upload to S3
            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: file.mimetype || "image/jpeg"
            });

            await s3Client.send(command);

            // Delete local temporary file
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error(`Failed to delete local temporary file ${file.path}:`, err);
            }

            // Determine URL
            const publicUrl = process.env.AWS_CLOUDFRONT_DOMAIN
                ? `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${s3Key}`
                : `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

            // Update file details to use the S3 URL
            file.path = publicUrl;
            file.s3_key = s3Key;
            file.cloudinary_id = s3Key; // Backwards compatibility for any legacy references
        };

        if (req.file) {
            await uploadSingle(req.file);
        }

        if (req.files && req.files.length > 0) {
            await Promise.all(req.files.map(file => uploadSingle(file)));
        }

        next();
    } catch (error) {
        console.error("S3 upload middleware error:", error);
        next(error);
    }
};

module.exports = s3Upload;
