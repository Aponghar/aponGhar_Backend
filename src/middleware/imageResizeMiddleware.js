const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const resizeImages = async (req, res, next) => {
    // If no files uploaded, skip
    if (!req.file && (!req.files || req.files.length === 0)) {
        return next();
    }

    try {
        const processFile = async (file) => {
            // Only process image files (jpeg, png, webp)
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                return; // skip non-images
            }

            const tempPath = file.path + "_temp";
            let sharpInstance = sharp(file.path);

            // Resize to maximum 1200x1200px maintaining aspect ratio
            sharpInstance = sharpInstance.resize({
                width: 1200,
                height: 1200,
                fit: "inside",
                withoutEnlargement: true
            });

            // Compress based on extension
            if (ext === ".png") {
                sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
            } else if (ext === ".webp") {
                sharpInstance = sharpInstance.webp({ quality: 80 });
            } else {
                sharpInstance = sharpInstance.jpeg({ quality: 80, mozjpeg: true });
            }

            await sharpInstance.toFile(tempPath);

            // Replace original file with the resized temp file
            await fs.unlink(file.path);
            await fs.rename(tempPath, file.path);
        };

        if (req.file) {
            await processFile(req.file);
        }

        if (req.files && req.files.length > 0) {
            await Promise.all(req.files.map(file => processFile(file)));
        }

        next();
    } catch (error) {
        console.error("Image resizing error:", error);
        // Do not block request if resizing fails, just log and continue
        next();
    }
};

module.exports = resizeImages;
