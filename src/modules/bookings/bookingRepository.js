const pool =
    require("../../config/db");



const createBooking =
    async (bookingData) => {

        const {

            booking_code,

            user_id,

            room_id,

            property_id,

            booking_type,

            pricing_option,

            check_in_date,

            check_in_time,

            check_out_date,

            check_out_time,

            guests,

            booked_rooms,

            guest_name,

            guest_email,

            guest_age,

            customer_name,

            total_amount,

            booking_base_amount,

            booking_commission_percentage,

            booking_commission_amount,

            booking_unit_base_price,

            booking_unit_selling_price,

            coupon_id,

            coupon_discount,

            wallet_used,

            gateway_paid,

            payment_method,

            special_requests

        } = bookingData;

        const [result] = await pool.query(

            `INSERT INTO bookings (

                booking_code,

                user_id,

                room_id,

                property_id,

                booking_type,

                pricing_option,

                check_in_date,

                check_in_time,

                check_out_date,

                check_out_time,

                guests,

                booked_rooms,

                guest_name,

                guest_email,

                guest_age,

                customer_name,

                total_amount,

                booking_base_amount,

                booking_commission_percentage,

                booking_commission_amount,

                booking_unit_base_price,

                booking_unit_selling_price,

                coupon_id,

                coupon_discount,

                wallet_used,

                gateway_paid,

                payment_method,

                special_requests

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [

                booking_code,

                user_id,

                room_id,

                property_id,

                booking_type,

                pricing_option,

                check_in_date,

                check_in_time,

                check_out_date,

                check_out_time,

                guests,

                booked_rooms,

                guest_name,

                guest_email,

                guest_age,

                customer_name,

                total_amount,

                booking_base_amount,

                booking_commission_percentage,

                booking_commission_amount,

                booking_unit_base_price,

                booking_unit_selling_price,

                coupon_id,

                coupon_discount,

                wallet_used,

                gateway_paid,

                payment_method,

                special_requests
            ]
        );

        return result;
};

const getBookingById =
    async (bookingId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM bookings

            WHERE id = ?`,

            [bookingId]
        );

        return rows[0];
};

const hasActiveCheckIn =
    async (bookingId) => {

        const [rows] = await pool.query(

            `SELECT id

            FROM check_ins

            WHERE booking_id = ?
            AND status != 'CANCELLED'

            LIMIT 1`,

            [bookingId]
        );

        return rows.length > 0;
};

const updateBookingStatus =
    async (
        bookingId,
        bookingStatus,
        paymentStatus = null
    ) => {

        if (paymentStatus) {

            await pool.query(

                `UPDATE bookings

                SET

                    booking_status = ?,

                    payment_status = ?,

                    owner_action_at = CASE
                        WHEN ? IN ('CONFIRMED', 'CANCELLED')
                        THEN CURRENT_TIMESTAMP
                        ELSE owner_action_at
                    END

                WHERE id = ?`,

                [
                    bookingStatus,
                    paymentStatus,
                    bookingStatus,
                    bookingId
                ]
            );

        } else {

            await pool.query(

                `UPDATE bookings

                SET
                    booking_status = ?,
                    owner_action_at = CASE
                        WHEN ? IN ('CONFIRMED', 'CANCELLED')
                        THEN CURRENT_TIMESTAMP
                        ELSE owner_action_at
                    END

                WHERE id = ?`,

                [
                    bookingStatus,
                    bookingStatus,
                    bookingId
                ]
            );
        }
};

const rejectBooking =
    async (
        bookingId,
        rejectionReason = null
    ) => {

        await pool.query(

            `UPDATE bookings

            SET
                booking_status = 'CANCELLED',
                payment_status = 'FAILED',
                owner_action_at = CURRENT_TIMESTAMP,
                rejection_reason = ?

            WHERE id = ?`,

            [
                rejectionReason,
                bookingId
            ]
        );
};

const getUserBookings =
    async (userId) => {

        const [rows] = await pool.query(

            `SELECT

                b.*,

                ci.id AS checkin_id,

                ci.status AS checkin_status,

                ci.checked_out_at,

                rv.id AS review_id,

                rv.rating AS review_rating,

                rv.created_at AS reviewed_at,

                p.property_name,

                p.location AS property_location,

                p.city AS property_city,

                r.room_name,

                r.room_type

            FROM bookings b

            LEFT JOIN properties p
            ON b.property_id = p.id

            LEFT JOIN room r
            ON b.room_id = r.id

            LEFT JOIN check_ins ci
            ON ci.booking_id = b.id
            AND ci.status != 'CANCELLED'

            LEFT JOIN reviews rv
            ON rv.booking_id = b.id
            AND rv.user_id = b.user_id

            WHERE b.user_id = ?

            ORDER BY b.created_at DESC`,

            [userId]
        );

        return rows;
};

const getOwnerBookings =
    async (ownerId) => {

        const [rows] = await pool.query(

            `SELECT

                b.id,

                b.booking_code,

                b.check_in_date,

                b.check_in_time,

                b.check_out_date,

                b.check_out_time,

                b.guests,

                b.booked_rooms,

                b.guest_name,

                b.guest_email,

                b.guest_age,

                b.customer_name,

                b.booking_type,

                b.pricing_option,

                b.total_amount,

                b.booking_base_amount,

                b.booking_commission_percentage,

                b.booking_commission_amount,

                b.booking_unit_base_price,

                b.booking_unit_selling_price,

                b.coupon_discount,

                b.wallet_used,

                b.gateway_paid,

                b.booking_status,

                b.payment_status,

                b.payment_method,

                b.rejection_reason,

                b.special_requests,

                b.created_at,

                u.full_name AS user_full_name,

                u.email AS user_email,

                u.phone AS user_phone,

                p.property_name,

                r.room_name

            FROM bookings b

            JOIN users u
            ON b.user_id = u.id

            JOIN properties p
            ON b.property_id = p.id

            JOIN room r
            ON b.room_id = r.id

            WHERE p.owner_id = ?

            ORDER BY b.created_at DESC`,

            [ownerId]
        );

        return rows;
};

const getBookingDetails =
    async (bookingId) => {

        const [rows] = await pool.query(

            `SELECT

                b.*,

                u.full_name AS user_full_name,

                u.email AS user_email,

                u.phone AS user_phone,

                p.property_name,

                r.room_name

            FROM bookings b

            JOIN users u
            ON b.user_id = u.id

            JOIN properties p
            ON b.property_id = p.id

            JOIN room r
            ON b.room_id = r.id

            WHERE b.id = ?`,

            [bookingId]
        );

        return rows[0];
};



module.exports = {

    createBooking,

    getBookingById,

    hasActiveCheckIn,

    updateBookingStatus,

    rejectBooking,

    getUserBookings,

    getOwnerBookings,

    getBookingDetails
};
