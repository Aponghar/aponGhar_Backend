const wishlistRepository = require("./wishlistRepository");

const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const wishlist = await wishlistRepository.getWishlistByUserId(userId);
        res.status(200).json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        next(error);
    }
};

const getWishlistIds = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const ids = await wishlistRepository.getWishlistedPropertyIds(userId);
        res.status(200).json({
            success: true,
            data: ids
        });
    } catch (error) {
        next(error);
    }
};

const toggleWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { propertyId } = req.body;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                message: "Property ID is required"
            });
        }

        const exists = await wishlistRepository.checkWishlistExists(userId, propertyId);

        if (exists) {
            await wishlistRepository.removeWishlistItem(userId, propertyId);
            res.status(200).json({
                success: true,
                message: "Property removed from wishlist",
                added: false
            });
        } else {
            await wishlistRepository.addWishlistItem(userId, propertyId);
            res.status(200).json({
                success: true,
                message: "Property added to wishlist",
                added: true
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWishlist,
    getWishlistIds,
    toggleWishlist
};
