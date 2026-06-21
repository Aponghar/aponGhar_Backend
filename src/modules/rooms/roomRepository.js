const pool = require("../../config/db");

const generateRoomId = () => {
    return 'ROOM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const createRoom = async (roomData) => {
    const {
        property_id,
        room_name,
        room_type,
        description,
        max_adults,
        max_children,
        bed_type,
        room_size,
        room_amenities,
        room_benefits,
        price_type,
        room_id: custom_room_id
    } = roomData;

    const room_id = custom_room_id && custom_room_id.trim() ? custom_room_id.trim() : generateRoomId();

    const [existingRows] = await pool.query(
        `SELECT id FROM room WHERE room_id = ? LIMIT 1`,
        [room_id]
    );

    if (existingRows.length > 0) {
        throw new Error("Room ID already exists");
    }

    const [result] = await pool.query(
        `INSERT INTO room (
            room_id,
            property_id,
            room_name,
            room_type,
            description,
            max_adults,
            max_children,
            bed_type,
            room_size,
            room_amenities,
            room_benefits,
            price_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            room_id,
            property_id,
            room_name,
            room_type,
            description,
            max_adults,
            max_children,
            bed_type,
            room_size,
            JSON.stringify(room_amenities || []),
            JSON.stringify(room_benefits || []),
            price_type
        ]
    );

    return { room_id, id: result.insertId };
};

const createRoomPrice = async (roomData) => {
    const {
        room_id,
        property_id,
        base_price,
        price_per_night,
        price_3hours,
        price_6hours,
        price_9hours
    } = roomData;

    await pool.query(
        `INSERT INTO room_price (
            room_id,
            property_id,
            base_price,
            price_per_night,
            price_3hours,
            price_6hours,
            price_9hours
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            room_id,
            property_id,
            base_price,
            price_per_night,
            price_3hours,
            price_6hours,
            price_9hours
        ]
    );
};

const createBulkRooms = async (rooms) => {
    const results = [];
    let idx = 1;
    for (const roomData of rooms) {
        const data = { ...roomData };
        if (data.room_id && rooms.length > 1) {
            data.room_id = `${data.room_id.trim()}-${idx}`;
        }
        const room = await createRoom(data);
        await createRoomPrice({
            ...data,
            room_id: room.room_id
        });
        results.push(room);
        idx++;
    }
    return results;
};

const getPropertyRooms = async (propertyId) => {
    const [rows] = await pool.query(
        `SELECT r.*, rp.base_price, rp.price_per_night, rp.price_3hours, rp.price_6hours, rp.price_9hours,
            p.commission_percentage,
            (SELECT image_url FROM room_images WHERE room_id = r.room_id LIMIT 1) AS room_image
        FROM room r
        LEFT JOIN room_price rp ON r.room_id = rp.room_id
        JOIN properties p ON r.property_id = p.id
        WHERE r.property_id = ? AND r.is_active = TRUE`,
        [propertyId]
    );
    return rows;
};

const getRoomById = async (roomId) => {
    const [rows] = await pool.query(
        `SELECT r.*, rp.base_price, rp.price_per_night, rp.price_3hours, rp.price_6hours, rp.price_9hours,
            p.commission_percentage
        FROM room r
        LEFT JOIN room_price rp ON r.room_id = rp.room_id
        JOIN properties p ON r.property_id = p.id
        WHERE r.id = ?`,
        [roomId]
    );
    return rows[0];
};

const getRoomByRoomId = async (roomId) => {
    const [rows] = await pool.query(
        `SELECT r.*, rp.base_price, rp.price_per_night, rp.price_3hours, rp.price_6hours, rp.price_9hours
        FROM room r
        LEFT JOIN room_price rp ON r.room_id = rp.room_id
        WHERE r.room_id = ?`,
        [roomId]
    );
    return rows[0];
};

const verifyPropertyOwnership = async (propertyId, ownerId) => {
    const [rows] = await pool.query(
        `SELECT * FROM properties WHERE id = ? AND owner_id = ? AND is_active = TRUE`,
        [propertyId, ownerId]
    );
    return rows[0];
};

const getOwnerPropertyById = async (propertyId, ownerId) => {
    const [rows] = await pool.query(
        `SELECT * FROM properties WHERE id = ? AND owner_id = ?`,
        [propertyId, ownerId]
    );
    return rows[0];
};

const createRoomImage = async (roomId, imageUrl) => {
    await pool.query(
        `INSERT INTO room_images (room_id, image_url) VALUES (?, ?)`,
        [roomId, imageUrl]
    );
};

const getRoomImages = async (roomId) => {
    const [rows] = await pool.query(
        `SELECT * FROM room_images WHERE room_id = ?`,
        [roomId]
    );
    return rows;
};

const getRoomTypeImages = async (propertyId, roomType) => {
    const [rows] = await pool.query(
        `SELECT ri.*
         FROM room_images ri
         JOIN room r ON ri.room_id = r.room_id
         WHERE r.property_id = ? AND r.room_type = ? AND r.is_active = TRUE
         ORDER BY ri.id DESC`,
        [propertyId, roomType]
    );
    return rows;
};

const verifyRoomOwnership = async (roomId, ownerId) => {
    const [rows] = await pool.query(
        `SELECT r.*, p.owner_id
        FROM room r
        JOIN properties p ON r.property_id = p.id
        WHERE r.id = ? AND p.owner_id = ? AND p.is_active = TRUE`,
        [roomId, ownerId]
    );
    return rows[0];
};

const verifyRoomOwnershipByRoomId = async (roomIdStr, ownerId) => {
    const [rows] = await pool.query(
        `SELECT r.*, p.owner_id
        FROM room r
        JOIN properties p ON r.property_id = p.id
        WHERE r.room_id = ? AND p.owner_id = ? AND p.is_active = TRUE`,
        [roomIdStr, ownerId]
    );
    return rows[0];
};

const updateRoom = async (roomId, roomData, currentRoomId) => {
    const {
        room_id,
        room_name,
        room_type,
        description,
        max_adults,
        max_children,
        bed_type,
        room_size,
        room_amenities,
        room_benefits,
        price_type
    } = roomData;

    const nextRoomId = room_id && room_id.trim()
        ? room_id.trim()
        : currentRoomId;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (nextRoomId !== currentRoomId) {
            const [existingRows] = await connection.query(
                `SELECT id FROM room WHERE room_id = ? AND id <> ? LIMIT 1`,
                [nextRoomId, roomId]
            );

            if (existingRows.length > 0) {
                throw new Error("Room ID already exists");
            }

            // Update associated images to the new room_id first to maintain consistency
            await connection.query(
                `UPDATE room_images
                SET room_id = ?
                WHERE room_id = ?`,
                [nextRoomId, currentRoomId]
            );

            await connection.query(
                `UPDATE room
                SET room_id = ?
                WHERE id = ?`,
                [nextRoomId, roomId]
            );
        }

        await connection.query(
            `UPDATE room
            SET
                room_name = ?,
                room_type = ?,
                description = ?,
                max_adults = ?,
                max_children = ?,
                bed_type = ?,
                room_size = ?,
                room_amenities = ?,
                room_benefits = ?,
                price_type = ?
            WHERE id = ?`,
            [
                room_name,
                room_type,
                description,
                max_adults,
                max_children,
                bed_type,
                room_size,
                JSON.stringify(room_amenities || []),
                JSON.stringify(room_benefits || []),
                price_type,
                roomId
            ]
        );

        await connection.commit();
        return nextRoomId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateRoomPrice = async (roomIdStr, priceData) => {
    const {
        base_price,
        price_per_night,
        price_3hours,
        price_6hours,
        price_9hours
    } = priceData;

    await pool.query(
        `UPDATE room_price
        SET
            base_price = ?,
            price_per_night = ?,
            price_3hours = ?,
            price_6hours = ?,
            price_9hours = ?
        WHERE room_id = ?`,
        [
            base_price,
            price_per_night,
            price_3hours,
            price_6hours,
            price_9hours,
            roomIdStr
        ]
    );
};

const deactivateRoom = async (roomId) => {
    await pool.query(
        `UPDATE room SET is_active = FALSE WHERE id = ?`,
        [roomId]
    );
};

const createInventoryRecord = async (roomId, inventoryDate, totalRooms) => {
    await pool.query(
        `INSERT INTO room_inventory (room_id, inventory_date, total_rooms, available_rooms)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            total_rooms = GREATEST(total_rooms, VALUES(total_rooms)),
            available_rooms = GREATEST(available_rooms, VALUES(available_rooms))`,
        [roomId, inventoryDate, totalRooms, totalRooms]
    );
};

const getActiveRoomCountForType = async (roomId) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS room_count
        FROM room matching_room
        JOIN room selected_room
        ON matching_room.property_id = selected_room.property_id
        AND matching_room.room_type = selected_room.room_type
        WHERE selected_room.id = ?
        AND matching_room.is_active = TRUE`,
        [roomId]
    );

    return Number(rows[0]?.room_count || 1);
};

const inventoryExists = async (roomId, inventoryDate) => {
    const [rows] = await pool.query(
        `SELECT id FROM room_inventory WHERE room_id = ? AND inventory_date = ?`,
        [roomId, inventoryDate]
    );
    return rows[0];
};

const getRoomInventory = async (roomId, startDate, endDate) => {
    const [rows] = await pool.query(
        `SELECT * FROM room_inventory
        WHERE room_id = ?
        AND inventory_date BETWEEN ? AND ?
        ORDER BY inventory_date ASC`,
        [roomId, startDate, endDate]
    );
    return rows;
};

const getInventoryByDate = async (roomId, inventoryDate) => {
    const [rows] = await pool.query(
        `SELECT * FROM room_inventory
        WHERE room_id = ? AND inventory_date = ?`,
        [roomId, inventoryDate]
    );
    return rows[0];
};

const reduceInventory = async (roomId, inventoryDate, quantity) => {
    const [result] = await pool.query(
        `UPDATE room_inventory
        SET available_rooms = available_rooms - ?
        WHERE room_id = ?
        AND inventory_date = ?
        AND available_rooms >= ?`,
        [quantity, roomId, inventoryDate, quantity]
    );
    return result;
};

const restoreInventory = async (roomId, inventoryDate, quantity) => {
    await pool.query(
        `UPDATE room_inventory
        SET available_rooms = available_rooms + ?
        WHERE room_id = ? AND inventory_date = ?`,
        [quantity, roomId, inventoryDate]
    );
};

const getAmenities = async () => {
    const [columns] = await pool.query(`SHOW COLUMNS FROM amenities`);
    const columnNames = columns.map((col) => col.Field);

    const nameColumn = columnNames.includes("amenity_name")
        ? "amenity_name"
        : columnNames.includes("name")
            ? "name"
            : null;

    if (!nameColumn) {
        return [];
    }

    const descriptionSelect = columnNames.includes("description")
        ? "description"
        : "NULL";

    const [rows] = await pool.query(
        `SELECT id, ${nameColumn} AS name, ${descriptionSelect} AS description
        FROM amenities
        ORDER BY ${nameColumn} ASC`
    );

    return rows;
};

const getAvailableRoomsByProperty = async (propertyId) => {
    const [rows] = await pool.query(
        `SELECT r.*, rp.base_price, rp.price_per_night, rp.price_3hours, rp.price_6hours, rp.price_9hours,
            p.commission_percentage,
            (
                SELECT ri.image_url 
                FROM room_images ri 
                JOIN room rm ON ri.room_id = rm.room_id 
                WHERE rm.property_id = r.property_id AND rm.room_type = r.room_type AND rm.is_active = TRUE 
                LIMIT 1
            ) AS room_image
        FROM room r
        JOIN (
            SELECT MIN(id) AS representative_id
            FROM room
            WHERE property_id = ? AND is_active = TRUE
            GROUP BY room_type
        ) room_types ON room_types.representative_id = r.id
        LEFT JOIN room_price rp ON r.room_id = rp.room_id
        JOIN properties p ON r.property_id = p.id
        ORDER BY r.room_type`,
        [propertyId]
    );
    return rows;
};

const getOwnerRoomManagement = async (ownerId, propertyId = null) => {
    const params = [ownerId];
    const propertyFilter = propertyId ? "AND r.property_id = ?" : "";

    if (propertyId) {
        params.push(propertyId);
    }

    const [rows] = await pool.query(
        `SELECT
            r.id,
            r.room_id,
            r.room_name,
            r.room_type,
            r.property_id,
            r.bed_type,
            r.room_size,
            p.property_name,
            ci.id AS checkin_id,
            ci.checked_out_at,
            ci.owner_confirmed_at,
            b.booking_code,
            b.guest_name,
            b.customer_name,
            b.guest_email,
            b.check_in_date,
            b.check_in_time,
            b.check_out_date,
            b.check_out_time,
            b.booked_rooms,
            b.guests
        FROM room r
        JOIN properties p
            ON r.property_id = p.id
        LEFT JOIN (
            SELECT
                active_ci.*
            FROM check_ins active_ci
            JOIN bookings active_b
                ON active_ci.booking_id = active_b.id
            WHERE active_ci.status != 'CANCELLED'
                AND active_ci.checked_out_at IS NULL
                AND TIMESTAMP(
                    active_b.check_out_date,
                    COALESCE(active_b.check_out_time, '23:59:59')
                ) >= NOW()
        ) ci
            ON ci.assigned_room_id = r.id
        LEFT JOIN bookings b
            ON ci.booking_id = b.id
        WHERE p.owner_id = ?
            AND p.is_active = TRUE
            AND p.approval_status = 'APPROVED'
            AND r.is_active = TRUE
            ${propertyFilter}
        ORDER BY p.property_name ASC, r.room_type ASC, r.room_id ASC`,
        params
    );

    return rows.map((row) => {
        const occupied = Boolean(row.checkin_id);

        return {
            ...row,
            occupancy_status: occupied ? "OCCUPIED" : "AVAILABLE"
        };
    });
};

module.exports = {
    createRoom,
    createRoomPrice,
    createBulkRooms,
    getPropertyRooms,
    getRoomById,
    getRoomByRoomId,
    verifyPropertyOwnership,
    getOwnerPropertyById,
    createRoomImage,
    getRoomImages,
    verifyRoomOwnership,
    verifyRoomOwnershipByRoomId,
    updateRoom,
    updateRoomPrice,
    deactivateRoom,
    createInventoryRecord,
    inventoryExists,
    getRoomInventory,
    getInventoryByDate,
    reduceInventory,
    restoreInventory,
    getActiveRoomCountForType,
    getAmenities,
    generateRoomId,
    getAvailableRoomsByProperty,
    getOwnerRoomManagement,
    getRoomTypeImages
};
