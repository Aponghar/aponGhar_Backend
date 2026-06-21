const roomRepository = require("./roomRepository");

const parseJsonArray = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    return [];
};

const formatDateOnly = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid inventory date");
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const addRoom = async (ownerId, propertyId, roomData) => {
    const property = await roomRepository.getOwnerPropertyById(
        propertyId,
        ownerId
    );

    if (!property) {
        throw new Error("Property not found or unauthorized");
    }

    if (!property.is_active) {
        const error = new Error("Property is deactivated by admin. Room management is disabled.");
        error.statusCode = 403;
        throw error;
    }

    roomData.property_id = propertyId;

    // Create room and pricing
    const roomResult = await roomRepository.createRoom(roomData);

    await roomRepository.createRoomPrice({
        room_id: roomResult.room_id,
        property_id: propertyId,
        base_price: roomData.base_price,
        price_per_night: roomData.price_per_night,
        price_3hours: roomData.price_3hours,
        price_6hours: roomData.price_6hours,
        price_9hours: roomData.price_9hours
    });

    return {
        message: "Room added successfully",
        room_id: roomResult.room_id,
        id: roomResult.id
    };
};

const addBulkRooms = async (ownerId, propertyId, rooms) => {
    const property = await roomRepository.getOwnerPropertyById(
        propertyId,
        ownerId
    );

    if (!property) {
        throw new Error("Property not found or unauthorized");
    }

    if (!property.is_active) {
        const error = new Error("Property is deactivated by admin. Room management is disabled.");
        error.statusCode = 403;
        throw error;
    }

    // Prepare rooms with property_id
    const roomsToCreate = rooms.map(room => ({
        ...room,
        property_id: propertyId
    }));

    // Create all rooms and pricing
    const results = await roomRepository.createBulkRooms(roomsToCreate);

    return {
        message: `${results.length} rooms added successfully`,
        rooms: results
    };
};

const getRooms = async (propertyId) => {
    const rooms = await roomRepository.getPropertyRooms(propertyId);
    return rooms.map(room => ({
        ...room,
        room_amenities: parseJsonArray(room.room_amenities),
        room_benefits: parseJsonArray(room.room_benefits)
    }));
};

const uploadRoomImages = async (ownerId, roomId, files) => {
    // Verify ownership
    const room = await roomRepository.verifyRoomOwnership(roomId, ownerId);

    if (!room) {
        const error = new Error("Room not found, unauthorized, or property is deactivated.");
        error.statusCode = 403;
        throw error;
    }

    // Save images
    for (const file of files) {
        await roomRepository.createRoomImage(room.room_id, file.path);
    }

    return { message: "Room images uploaded successfully" };
};

const getRoomGallery = async (roomId) => {
    const room = await roomRepository.getRoomById(roomId);
    if (!room) return [];
    return roomRepository.getRoomImages(room.room_id);
};

const editRoom = async (ownerId, roomId, roomData) => {
    // Verify ownership
    const room = await roomRepository.verifyRoomOwnership(roomId, ownerId);

    if (!room) {
        const error = new Error("Room not found, unauthorized, or property is deactivated.");
        error.statusCode = 403;
        throw error;
    }

    const updatedRoomId = await roomRepository.updateRoom(
        roomId,
        roomData,
        room.room_id
    );

    const hasAnyPriceField = [
        "base_price",
        "price_per_night",
        "price_3hours",
        "price_6hours",
        "price_9hours"
    ].some((field) => Object.prototype.hasOwnProperty.call(roomData, field));

    if (updatedRoomId && hasAnyPriceField) {
        await roomRepository.updateRoomPrice(updatedRoomId, roomData);
    }

    return { message: "Room updated successfully" };
};

const deleteRoom = async (ownerId, roomId) => {
    // Verify ownership
    const room = await roomRepository.verifyRoomOwnership(roomId, ownerId);

    if (!room) {
        const error = new Error("Room not found, unauthorized, or property is deactivated.");
        error.statusCode = 403;
        throw error;
    }

    await roomRepository.deactivateRoom(roomId);

    return { message: "Room deleted successfully" };
};

const generateRoomInventory = async (ownerId, roomId, startDate, endDate) => {
    // Verify ownership
    const room = await roomRepository.verifyRoomOwnership(roomId, ownerId);

    if (!room) {
        const error = new Error("Room not found, unauthorized, or property is deactivated.");
        error.statusCode = 403;
        throw error;
    }

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const formattedDate = formatDateOnly(currentDate);

        // Check existing inventory
        const exists = await roomRepository.inventoryExists(roomId, formattedDate);

        // Create only if not exists
        if (!exists) {
            await roomRepository.createInventoryRecord(roomId, formattedDate, 1);
        }

        // Next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { message: "Inventory generated successfully" };
};

const getInventory = async (roomId, startDate, endDate) => {
    return roomRepository.getRoomInventory(roomId, startDate, endDate);
};

const lockRoomInventory = async (roomId, startDate, endDate, quantity = 1) => {
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const roomCount = await roomRepository.getActiveRoomCountForType(roomId);

    while (currentDate < lastDate) {
        const formattedDate = formatDateOnly(currentDate);

        // Check inventory
        let inventory = await roomRepository.getInventoryByDate(
            roomId,
            formattedDate
        );

        if (!inventory) {
            await roomRepository.createInventoryRecord(
                roomId,
                formattedDate,
                roomCount
            );

            inventory = await roomRepository.getInventoryByDate(
                roomId,
                formattedDate
            );
        }

        // Check availability
        if (inventory.available_rooms < quantity) {
            const error = new Error(`Insufficient inventory for ${formattedDate}`);
            error.statusCode = 400;
            throw error;
        }

        // Reduce inventory
        const result = await roomRepository.reduceInventory(
            roomId,
            formattedDate,
            quantity
        );

        // Safety check
        if (result.affectedRows === 0) {
            const error = new Error(`Inventory lock failed for ${formattedDate}`);
            error.statusCode = 400;
            throw error;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { message: "Inventory locked successfully" };
};

const releaseRoomInventory = async (roomId, startDate, endDate, quantity = 1) => {
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate < lastDate) {
        const formattedDate = formatDateOnly(currentDate);

        await roomRepository.restoreInventory(
            roomId,
            formattedDate,
            quantity
        );

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return { message: "Inventory restored successfully" };
};

const getAmenities = async () => {
    return roomRepository.getAmenities();
};

const getAvailableRoomsByProperty = async (propertyId) => {
    const rooms = await roomRepository.getAvailableRoomsByProperty(propertyId);
    return rooms.map(room => ({
        ...room,
        room_amenities: parseJsonArray(room.room_amenities),
        room_benefits: parseJsonArray(room.room_benefits)
    }));
};

const getOwnerRoomManagement = async (ownerId, propertyId = null) => {
    return roomRepository.getOwnerRoomManagement(ownerId, propertyId);
};

module.exports = {
    addRoom,
    addBulkRooms,
    getRooms,
    uploadRoomImages,
    getRoomGallery,
    editRoom,
    deleteRoom,
    generateRoomInventory,
    getInventory,
    lockRoomInventory,
    releaseRoomInventory,
    getAmenities,
    getAvailableRoomsByProperty,
    getOwnerRoomManagement
};
