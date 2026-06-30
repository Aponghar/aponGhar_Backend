const pool =
    require("../../config/db");

const createCoupon =
    async (couponData) => {

        const {

            owner_id,

            property_id,

            coupon_code,

            discount_type,

            discount_value,

            minimum_booking_amount,

            maximum_discount_amount,

            usage_limit,

            start_date,

            expiry_date,

            once_per_user

        } = couponData;

        const [result] =
            await pool.query(

                `INSERT INTO coupons (

                    owner_id,

                    property_id,

                    coupon_code,

                    discount_type,

                    discount_value,

                    minimum_booking_amount,

                    maximum_discount_amount,

                    usage_limit,

                    start_date,

                    expiry_date,

                    once_per_user

                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                [

                    owner_id,

                    property_id || null,

                    coupon_code,

                    discount_type,

                    discount_value,

                    minimum_booking_amount,

                    maximum_discount_amount || null,

                    usage_limit || null,

                    start_date,

                    expiry_date,

                    once_per_user ? 1 : 0

                ]
            );

        return result;
};

const getCouponByCode =
    async (couponCode) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM coupons

                WHERE coupon_code = ?`,

                [couponCode]
            );

        return rows[0];
};

const getCouponsByOwner =
    async (ownerId) => {

        const [rows] =
            await pool.query(

                `SELECT

                    c.*,

                    p.property_name

                FROM coupons c

                LEFT JOIN properties p
                ON c.property_id = p.id

                WHERE c.owner_id = ?

                ORDER BY c.created_at DESC`,

                [ownerId]
            );

        return rows;
};

const getCouponById =
    async (couponId) => {

        const [rows] =
            await pool.query(

                `SELECT

                    c.*,

                    p.property_name

                FROM coupons c

                LEFT JOIN properties p
                ON c.property_id = p.id

                WHERE c.id = ?`,

                [couponId]
            );

        return rows[0];
};

const getCouponUsages =
    async (couponId) => {

        const [rows] =
            await pool.query(

                `SELECT

                    cu.*,

                    u.full_name AS user_name,

                    u.email AS user_email,

                    b.booking_code,

                    b.total_amount AS booking_amount

                FROM coupon_usages cu

                JOIN users u
                ON cu.user_id = u.id

                JOIN bookings b
                ON cu.booking_id = b.id

                WHERE cu.coupon_id = ?

                ORDER BY cu.used_at DESC`,

                [couponId]
            );

        return rows;
};

const getCouponStats =
    async (couponId) => {

        const [rows] =
            await pool.query(

                `SELECT

                    COUNT(*) AS total_uses,

                    COALESCE(
                        SUM(discount_amount), 0
                    ) AS total_discount_given,

                    COUNT(
                        DISTINCT user_id
                    ) AS unique_users

                FROM coupon_usages

                WHERE coupon_id = ?`,

                [couponId]
            );

        return rows[0];
};

const toggleCouponStatus =
    async (couponId, isActive) => {

        await pool.query(

            `UPDATE coupons

            SET is_active = ?

            WHERE id = ?`,

            [isActive, couponId]
        );
};

const deleteCoupon =
    async (couponId) => {

        await pool.query(

            `DELETE FROM coupons

            WHERE id = ?`,

            [couponId]
        );
};

const incrementCouponUsage =
    async (couponId) => {

        await pool.query(

            `UPDATE coupons

            SET used_count =
                used_count + 1

            WHERE id = ?`,

            [couponId]
        );
};

const createCouponUsage =
    async (usageData) => {

        const {

            coupon_id,

            user_id,

            booking_id,

            discount_amount

        } = usageData;

        const [result] =
            await pool.query(

                `INSERT INTO coupon_usages (

                    coupon_id,

                    user_id,

                    booking_id,

                    discount_amount

                )

                VALUES (?, ?, ?, ?)`,

                [

                    coupon_id,

                    user_id,

                    booking_id,

                    discount_amount
                ]
            );

        return result;
};

const getUserCouponUsageCount =
    async (couponId, userId) => {

        const [rows] =
            await pool.query(

                `SELECT COUNT(cu.id) AS count

                FROM coupon_usages cu

                JOIN bookings b ON cu.booking_id = b.id

                WHERE cu.coupon_id = ? AND cu.user_id = ?

                AND b.booking_status != 'CANCELLED'`,

                [couponId, userId]
            );

        return rows[0].count;
};

const decrementCouponUsage =
    async (couponId) => {

        await pool.query(

            `UPDATE coupons

            SET used_count = GREATEST(0, used_count - 1)

            WHERE id = ?`,

            [couponId]
        );
};

const deleteCouponUsageByBookingId =
    async (bookingId) => {

        await pool.query(

            `DELETE FROM coupon_usages

            WHERE booking_id = ?`,

            [bookingId]
        );
};

const getApplicableCouponsForProperty =
    async (propertyId) => {

        const [rows] =
            await pool.query(

                `SELECT *
                FROM coupons
                WHERE is_active = 1
                  AND (property_id = ? OR property_id IS NULL)
                  AND start_date <= NOW()
                  AND expiry_date >= NOW()
                  AND (usage_limit IS NULL OR used_count < usage_limit)
                ORDER BY created_at DESC`,

                [propertyId]
            );

        return rows;
};

module.exports = {

    createCoupon,

    getCouponByCode,

    getCouponsByOwner,

    getCouponById,

    getCouponUsages,

    getCouponStats,

    toggleCouponStatus,

    deleteCoupon,

    incrementCouponUsage,

    createCouponUsage,

    getUserCouponUsageCount,

    decrementCouponUsage,

    deleteCouponUsageByBookingId,

    getApplicableCouponsForProperty
};