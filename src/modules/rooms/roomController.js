const roomService = require("./roomService");
const { roomSchema, bulkRoomSchema } = require("./roomValidation");

const createRoom = async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const { error } = roomSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result = await roomService.addRoom(
            req.user.id,
            propertyId,
            req.body
        );

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createBulkRooms = async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const { error } = bulkRoomSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result = await roomService.addBulkRooms(
            req.user.id,
            propertyId,
            req.body.rooms
        );

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getRooms = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        const rooms = await roomService.getRooms(propertyId);

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

const uploadRoomImages = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const result = await roomService.uploadRoomImages(
            req.user.id,
            roomId,
            req.files
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getRoomGallery = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const images = await roomService.getRoomGallery(roomId);

        res.status(200).json({
            success: true,
            data: images
        });
    } catch (error) {
        next(error);
    }
};

const updateRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { error } = roomSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result = await roomService.editRoom(
            req.user.id,
            roomId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const result = await roomService.deleteRoom(req.user.id, roomId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const generateInventory = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { start_date, end_date } = req.body;

        const result = await roomService.generateRoomInventory(
            req.user.id,
            roomId,
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getInventory = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { start_date, end_date } = req.query;

        const inventory = await roomService.getInventory(
            roomId,
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            data: inventory
        });
    } catch (error) {
        next(error);
    }
};

const lockInventory = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { start_date, end_date, quantity } = req.body;

        const result = await roomService.lockRoomInventory(
            roomId,
            start_date,
            end_date,
            quantity
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const releaseInventory = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { start_date, end_date, quantity } = req.body;

        const result = await roomService.releaseRoomInventory(
            roomId,
            start_date,
            end_date,
            quantity
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAmenities = async (req, res, next) => {
    try {
        const amenities = await roomService.getAmenities();

        res.status(200).json({
            success: true,
            data: amenities
        });
    } catch (error) {
        next(error);
    }
};

const getAvailableRoomsByProperty = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        const rooms = await roomService.getAvailableRoomsByProperty(propertyId);

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

const getOwnerRoomManagement = async (req, res, next) => {
    try {
        const rooms = await roomService.getOwnerRoomManagement(
            req.user.id,
            req.query.property_id
        );

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
