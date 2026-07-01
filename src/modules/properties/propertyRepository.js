const pool =
    require("../../config/db");



const createProperty =
    async (propertyData) => {

        const {

            owner_id,

            property_name,

            property_type,

            description,

            location,

            address,

            city,

            state,

            country,

            zip_code,

            latitude,

            longitude,

            google_maps_link,

            check_in_time,

            check_out_time,

            check_in_time_hourly,

            check_out_time_hourly,

            property_image

        } = propertyData;

        const [result] = await pool.query(

            `INSERT INTO properties (

                owner_id,

                property_name,

                property_type,

                description,

                location,

                address,

                city,

                state,

                country,

                zip_code,

                latitude,

                longitude,

                google_maps_link,

                check_in_time,

                check_out_time,

                check_in_time_hourly,

                check_out_time_hourly,

                property_image

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [

                owner_id,

                property_name,

                property_type,

                description,

                location,

                address,

                city,

                state,

                country,

                zip_code,

                latitude,

                longitude,

                google_maps_link,

                check_in_time || null,

                check_out_time || null,

                check_in_time_hourly || null,

                check_out_time_hourly || null,

                property_image

            ]
        );

        return result;
};



const getOwnerProperties =
    async (ownerId) => {

        const [rows] = await pool.query(

            `SELECT * FROM properties
            WHERE owner_id = ?`,

            [ownerId]
        );

        return rows;
};



const getPropertyById =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT * FROM properties
            WHERE id = ?`,

            [propertyId]
        );

        return rows[0];
};

const createPropertyImage =
    async (
        propertyId,
        imageUrl
    ) => {

        await pool.query(

            `INSERT INTO property_images
            (
                property_id,
                image_url
            )

            VALUES (?, ?)`,

            [
                propertyId,
                imageUrl
            ]
        );
};

const getPropertyImages =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT * FROM property_images
            WHERE property_id = ?`,

            [propertyId]
        );

        return rows;
};


const verifyPropertyOwnership =
    async (
        propertyId,
        ownerId
    ) => {

        const [rows] = await pool.query(

            `SELECT * FROM properties

            WHERE id = ?
            AND owner_id = ?`,

            [
                propertyId,
                ownerId
            ]
        );

        return rows[0];
};

const updateProperty =
    async (
        propertyId,
        propertyData
    ) => {

        const {

            property_name,

            property_type,

            description,

            location,

            address,

            city,

            state,

            country,

            zip_code,

            latitude,

            longitude,

            google_maps_link,

            check_in_time,

            check_out_time,

            check_in_time_hourly,

            check_out_time_hourly

        } = propertyData;

        await pool.query(

            `UPDATE properties

            SET

                property_name = ?,

                property_type = ?,

                description = ?,

                location = ?,

                address = ?,

                city = ?,

                state = ?,

                country = ?,

                zip_code = ?,

                latitude = ?,

                longitude = ?,

                google_maps_link = ?,

                check_in_time = ?,

                check_out_time = ?,

                check_in_time_hourly = ?,

                check_out_time_hourly = ?

            WHERE id = ?`,

            [

                property_name,

                property_type,

                description,

                location,

                address,

                city,

                state,

                country,

                zip_code,

                latitude,

                longitude,

                google_maps_link,

                check_in_time || null,

                check_out_time || null,

                check_in_time_hourly || null,

                check_out_time_hourly || null,

                propertyId
            ]
        );
};

const deactivateProperty =
    async (propertyId) => {

        await pool.query(

            `UPDATE properties

            SET is_active = FALSE

            WHERE id = ?`,

            [propertyId]
        );
};

const addPropertyAmenity =
    async (
        propertyId,
        amenityId
    ) => {

        await pool.query(

            `INSERT INTO property_amenities
            (
                property_id,
                amenity_id
            )

            VALUES (?, ?)`,

            [
                propertyId,
                amenityId
            ]
        );
};

const getPropertyAmenities =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT

                pa.id,

                a.amenity_name,

                a.icon

            FROM property_amenities pa

            JOIN amenities a
            ON pa.amenity_id = a.id

            WHERE pa.property_id = ?`,

            [propertyId]
        );

        return rows;
};

const getAllAmenities =
    async () => {

        const [rows] = await pool.query(

            `SELECT * FROM amenities`
        );

        return rows;
};

const createPropertyRule =
    async (
        propertyId,
        ruleType,
        ruleValue
    ) => {

        await pool.query(

            `INSERT INTO property_rules
            (
                property_id,
                rule_type,
                rule_value
            )

            VALUES (?, ?, ?)`,

            [
                propertyId,
                ruleType,
                ruleValue
            ]
        );
};

const getPropertyRules =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM property_rules

            WHERE property_id = ?`,

            [propertyId]
        );

        return rows;
};

const updatePropertyRule =
    async (
        ruleId,
        ruleValue
    ) => {

        await pool.query(

            `UPDATE property_rules

            SET rule_value = ?

            WHERE id = ?`,

            [
                ruleValue,
                ruleId
            ]
        );
};

const searchAvailableRooms =
    async (filters) => {

        const {

            city,

            check_in,

            check_out,

            guests,

            min_price,

            max_price,

            room_type,

            amenities,

            sort_by = "price_low",

            page = 1,

            limit = 10

        } = filters;

        const offset =
            (page - 1) * limit;

        // SORTING
        const priceExpression =
            "(COALESCE(rp.price_per_night, rp.base_price, 0) * (1 + COALESCE(p.commission_percentage, 0) / 100))";

        let orderBy =
            "selling_price ASC";

        if (
            sort_by === "price_high"
        ) {

            orderBy =
                "selling_price DESC";
        }

        if (
            sort_by === "newest"
        ) {

            orderBy =
                "p.created_at DESC";
        }

        // AMENITY FILTER
        let amenityJoin = "";
        let amenityWhere = "";

        if (
            amenities &&
            amenities.length > 0
        ) {

            amenityJoin =

                `JOIN property_amenities pa
                ON p.id = pa.property_id

                JOIN amenities a
                ON pa.amenity_id = a.id`;

            amenityWhere =

                `AND a.amenity_name IN (?)`;
        }

        const [rows] = await pool.query(

            `SELECT

                p.id AS property_id,

                p.property_name,

                p.city,

                p.state,

                p.featured,

                r.id AS room_id,

                r.room_name,

                r.room_type,

                MIN(${priceExpression}) AS selling_price,

                r.max_adults,

                MIN(
                    ri.available_rooms
                ) AS available_rooms

            FROM properties p

            JOIN room r
            ON p.id = r.property_id

            JOIN room_price rp
            ON r.room_id = rp.room_id

            JOIN room_inventory ri
            ON r.id = ri.room_id

            ${amenityJoin}

            WHERE

                p.approval_status = 'APPROVED'

                AND
                p.city = ?

                AND r.is_active = TRUE

                AND ri.inventory_date
                BETWEEN ? AND ?

                AND r.max_adults >= ?

                AND ${priceExpression}
                BETWEEN ? AND ?

                AND ri.available_rooms > 0

                ${room_type
                    ? "AND r.room_type = ?"
                    : ""}

                ${amenityWhere}

            GROUP BY
                p.id,
                p.property_name,
                p.city,
                p.state,
                p.featured,
                p.created_at,
                r.id,
                r.room_name,
                r.room_type,
                r.max_adults

            HAVING
                MIN(
                    ri.available_rooms
                ) > 0

            ORDER BY
                ${orderBy}

            LIMIT ?
            OFFSET ?`,

            [

                city,

                check_in,

                check_out,

                guests,

                min_price,

                max_price,

                ...(room_type
                    ? [room_type]
                    : []),

                ...(amenities &&
                amenities.length > 0
                    ? [amenities]
                    : []),

                Number(limit),

                Number(offset)
            ]
        );

        return rows;
};

const getFeaturedProperties =
    async () => {

        const [rows] = await pool.query(

            `SELECT *

            FROM properties

            WHERE featured = TRUE
            AND is_active = TRUE
            AND approval_status = 'APPROVED'

            ORDER BY created_at DESC

            LIMIT 10`
        );

        return rows;
};

const incrementPropertyBookings =
    async (propertyId) => {

        await pool.query(

            `UPDATE properties

            SET total_bookings =
                total_bookings + 1

            WHERE id = ?`,

            [propertyId]
        );
};

const countSearchResults =
    async (filters) => {

        const {

            city,

            check_in,

            check_out,

            guests,

            min_price,

            max_price,

            room_type

        } = filters;

        const [rows] = await pool.query(

            `SELECT COUNT(DISTINCT r.id)
            AS total

            FROM properties p

            JOIN room r
            ON p.id = r.property_id

            JOIN room_price rp
            ON r.room_id = rp.room_id

            JOIN room_inventory ri
            ON r.id = ri.room_id

            WHERE

                p.city = ?

                AND r.is_active = TRUE

                AND ri.inventory_date
                BETWEEN ? AND ?

                AND r.max_adults >= ?

                AND (COALESCE(rp.price_per_night, rp.base_price, 0) * (1 + COALESCE(p.commission_percentage, 0) / 100))
                BETWEEN ? AND ?

                ${room_type
                    ? "AND r.room_type = ?"
                    : ""}

                AND ri.available_rooms > 0`,

            [

                city,

                check_in,

                check_out,

                guests,

                min_price,

                max_price,

                ...(room_type
                    ? [room_type]
                    : [])
            ]
        );

        return rows[0].total;
};

const getTrendingProperties =
    async () => {

        const [rows] = await pool.query(

            `SELECT *

            FROM properties

            WHERE is_active = TRUE AND approval_status = 'APPROVED'

            ORDER BY

                total_bookings DESC,

                featured DESC,

                created_at DESC

            LIMIT 10`
        );

        return rows;
};

const getTopRatedProperties =
    async () => {

        const [rows] = await pool.query(

            `SELECT

                id,

                property_name,

                city,

                average_rating,

                total_reviews,

                trust_score,

                total_bookings

            FROM properties

            WHERE

                is_active = TRUE AND approval_status = 'APPROVED'

                AND total_reviews >= 5

            ORDER BY

                trust_score DESC,

                average_rating DESC,

                total_reviews DESC

            LIMIT 10`
        );

        return rows;
};

const getCompletePropertyDetails =
    async (propertyId) => {

        // PROPERTY
        const [propertyRows] =
            await pool.query(

                `SELECT *

                FROM properties

                WHERE id = ?
                AND is_active = TRUE`,

                [propertyId]
            );

        const property =
            propertyRows[0];

        if (!property) {
            return null;
        }

        // GALLERY
        const [gallery] =
            await pool.query(

                `SELECT *

                FROM property_images

                WHERE property_id = ?`,

                [propertyId]
            );

        // AMENITIES
        const [amenities] =
            await pool.query(

                `SELECT

                    a.id,
                    a.amenity_name,
                    a.icon

                FROM property_amenities pa

                JOIN amenities a
                ON pa.amenity_id = a.id

                WHERE pa.property_id = ?`,

                [propertyId]
            );

        // RULES
        const [rules] =
            await pool.query(

                `SELECT *

                FROM property_rules

                WHERE property_id = ?`,

                [propertyId]
            );

        // ROOMS
        const [rooms] =
            await pool.query(

                `SELECT *

                FROM room

                WHERE property_id = ?
                AND is_active = TRUE`,

                [propertyId]
            );

        return {

            property,

            gallery,

            amenities,

            rules,

            rooms
        };
};

const getAllProperties =
    async (limit, offset) => {

        let query = `SELECT 
                p.id,
                p.property_name,
                p.property_type,
                p.location,
                p.city,
                p.state,
                p.check_in_time,
                p.check_out_time,
                p.check_in_time_hourly,
                p.check_out_time_hourly,
                p.description,
                p.property_image,
                p.average_rating,
                p.total_reviews,
                p.trust_score,
                p.featured,
                p.commission_percentage,
                p.created_at,
                GROUP_CONCAT(DISTINCT pi.image_url ORDER BY pi.id SEPARATOR '||') AS gallery_images
                
            FROM properties p
            LEFT JOIN property_images pi
                ON pi.property_id = p.id
                
            WHERE p.is_active = TRUE 
                AND p.approval_status = 'APPROVED'
                
            GROUP BY p.id
            ORDER BY p.created_at DESC`;

        const params = [];
        if (limit !== undefined && offset !== undefined) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(Number(limit), Number(offset));
        }

        const [rows] = await pool.query(query, params);
        return rows;
};

const countAllProperties =
    async () => {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS total 
             FROM properties 
             WHERE is_active = TRUE 
             AND approval_status = 'APPROVED'`
        );
        return rows[0]?.total || 0;
};

const getRoomsForProperties = async (propertyIds) => {
    if (!propertyIds || propertyIds.length === 0) return [];
    
    const [rows] = await pool.query(
        `SELECT r.*, rp.base_price, rp.price_per_night, rp.price_3hours, rp.price_6hours, rp.price_9hours,
            p.commission_percentage
         FROM room r
         LEFT JOIN room_price rp ON r.room_id = rp.room_id
         JOIN properties p ON r.property_id = p.id
         WHERE r.property_id IN (?) AND r.is_active = TRUE`,
        [propertyIds]
    );
    return rows;
};

module.exports = {

    createProperty,

    getOwnerProperties,

    getPropertyById,

    createPropertyImage,

    getPropertyImages,

    verifyPropertyOwnership,

    updateProperty,

    deactivateProperty,

    addPropertyAmenity,

    getPropertyAmenities,

    getAllAmenities,

    createPropertyRule,

    getPropertyRules,
    
    updatePropertyRule,
    
    searchAvailableRooms,

    getFeaturedProperties,

    incrementPropertyBookings,

    countSearchResults,

    getTrendingProperties,

    getTopRatedProperties,

    getCompletePropertyDetails,

    getAllProperties,
    
    countAllProperties,

    getRoomsForProperties
};
