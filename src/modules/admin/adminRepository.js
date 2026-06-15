const pool =
    require("../../config/db");

const getDashboardStats =
    async () => {

        const [[users]] =
            await pool.query(

                `SELECT COUNT(*) AS total_users
                FROM users`
            );

        const [[owners]] =
            await pool.query(

                `SELECT COUNT(*) AS total_owners
                FROM users
                WHERE role = 'OWNER'`
            );

        const [[properties]] =
            await pool.query(

                `SELECT COUNT(*) AS total_properties
                FROM properties`
            );

        const [[bookings]] =
            await pool.query(

                `SELECT COUNT(*) AS total_bookings
                FROM bookings`
            );

        const [[revenue]] =
            await pool.query(

                `SELECT

                    SUM(total_amount)
                    AS total_revenue

                FROM bookings

                WHERE payment_status = 'PAID'`
            );

        return {

            total_users:
                users.total_users,

            total_owners:
                owners.total_owners,

            total_properties:
                properties.total_properties,

            total_bookings:
                bookings.total_bookings,

            total_revenue:
                revenue.total_revenue || 0
        };
};

const getPendingOwnerApplications =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM owner_applications

                WHERE status =
                'PENDING'

                ORDER BY created_at DESC`
            );

        return rows;
};

const getAllUsers =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    id,

                    full_name,

                    email,

                    role,

                    created_at

                FROM users

                ORDER BY created_at DESC`
            );

        return rows;
};

const updateOwnerApplication =
    async (
        applicationId,
        status
    ) => {

        await pool.query(

            `UPDATE owner_applications

            SET status = ?

            WHERE id = ?`,

            [
                status,
                applicationId
            ]
        );
};

const updateUserRole =
    async (
        userId,
        role
    ) => {

        await pool.query(

            `UPDATE users

            SET role = ?

            WHERE id = ?`,

            [
                role,
                userId
            ]
        );
};

const getPendingProperties =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    p.id,

                    p.property_name,

                    p.city,

                    p.state,

                    p.created_at,

                    u.full_name AS owner_name,

                    u.email

                FROM properties p

                JOIN users u
                ON p.owner_id = u.id

                WHERE p.approval_status =
                'PENDING'

                ORDER BY p.created_at DESC`
            );

        return rows;
};

const updatePropertyStatus =
    async (
        propertyId,
        status
    ) => {

        await pool.query(

            `UPDATE properties

            SET approval_status = ?

            WHERE id = ?`,

            [
                status,
                propertyId
            ]
        );
};

const getAllBookings =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    b.id,

                    b.booking_code,

                    b.booking_status,

                    b.payment_status,

                    b.total_amount,

                    b.booking_base_amount,

                    b.booking_commission_percentage,

                    b.booking_commission_amount,

                    b.created_at,

                    u.full_name AS user_name,

                    p.property_name

                FROM bookings b

                JOIN users u
                ON b.user_id = u.id

                JOIN properties p
                ON b.property_id = p.id

                ORDER BY b.created_at DESC`
            );

        return rows;
};

const getRefundBookings =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    booking_code,

                    total_amount,

                    booking_status,

                    payment_status

                FROM bookings

                WHERE payment_status =
                'REFUNDED'

                ORDER BY updated_at DESC`
            );

        return rows;
};

const getMonthlyRevenue =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    DATE_FORMAT(
                        created_at,
                        '%Y-%m'
                    ) AS month,

                    SUM(total_amount)
                    AS revenue,

                    COUNT(*)
                    AS total_bookings

                FROM bookings

                WHERE payment_status = 'PAID'

                GROUP BY month

                ORDER BY month DESC`
            );

        return rows;
};

const getRefundAnalytics =
    async () => {

        const [[result]] =
            await pool.query(

                `SELECT

                    COUNT(*) AS total_refunds,

                    SUM(total_amount)
                    AS refunded_amount

                FROM bookings

                WHERE payment_status =
                'REFUNDED'`
            );

        return result;
};

const getBookingStatusAnalytics =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    booking_status,

                    COUNT(*) AS total

                FROM bookings

                GROUP BY booking_status`
            );

        return rows;
};

const getTopPerformingProperties =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    p.id,

                    p.property_name,

                    p.city,

                    p.average_rating,

                    p.total_bookings,

                    COUNT(b.id)
                    AS booking_count,

                    SUM(b.total_amount)
                    AS total_revenue

                FROM properties p

                LEFT JOIN bookings b
                ON p.id = b.property_id

                WHERE b.payment_status =
                'PAID'

                GROUP BY p.id

                ORDER BY total_revenue DESC

                LIMIT 10`
            );

        return rows;
};

const getOwnerPerformance =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    u.id,

                    u.full_name,

                    u.email,

                    COUNT(DISTINCT p.id)
                    AS total_properties,

                    COUNT(b.id)
                    AS total_bookings,

                    SUM(b.total_amount)
                    AS total_revenue

                FROM users u

                LEFT JOIN properties p
                ON u.id = p.owner_id

                LEFT JOIN bookings b
                ON p.id = b.property_id

                WHERE u.role = 'OWNER'

                GROUP BY u.id

                ORDER BY total_revenue DESC`
            );

        return rows;
};

const getPlatformKPIs =
    async () => {

        const [[users]] =
            await pool.query(

                `SELECT COUNT(*)
                AS total_users

                FROM users`
            );

        const [[properties]] =
            await pool.query(

                `SELECT COUNT(*)
                AS total_properties

                FROM properties

                WHERE approval_status =
                'APPROVED'`
            );

        const [[activeBookings]] =
            await pool.query(

                `SELECT COUNT(*)
                AS active_bookings

                FROM bookings

                WHERE booking_status IN (
                    'CONFIRMED',
                    'COMPLETED'
                )`
            );

        const [[avgBookingValue]] =
            await pool.query(

                `SELECT AVG(total_amount)
                AS avg_booking_value

                FROM bookings

                WHERE payment_status =
                'PAID'`
            );

        return {

            total_users:
                users.total_users,

            approved_properties:
                properties.total_properties,

            active_bookings:
                activeBookings.active_bookings,

            average_booking_value:
                avgBookingValue.avg_booking_value || 0
        };
};

const getApprovedOwners =
async () => {

    const [rows] =
    await pool.query(

        `SELECT

            oa.id,

            oa.property_name,

            oa.property_type,

            oa.location,

            oa.area,

            oa.owner_name,

            oa.contact_number,

            oa.description,

            oa.status,

            u.email

        FROM owner_applications oa

        JOIN users u
        ON oa.user_id = u.id

        WHERE oa.status =
        'APPROVED'

        ORDER BY oa.created_at DESC`
    );

    return rows;
};

const getAllProperties =
async () => {

    const [rows] =
    await pool.query(

        `SELECT *

        FROM properties

        ORDER BY created_at DESC`
    );

    return rows;
};

const getPropertyById =
async (propertyId) => {

    const [rows] =
    await pool.query(

        `SELECT *

        FROM properties

        WHERE id = ?

        LIMIT 1`,

        [propertyId]
    );

    return rows[0];
};

const deactivatePropertyByAdmin =
async (propertyId) => {

    await pool.query(

        `UPDATE properties

        SET is_active = FALSE

        WHERE id = ?`,

        [propertyId]
    );
};

const activatePropertyByAdmin =
async (propertyId) => {

    await pool.query(

        `UPDATE properties

        SET is_active = TRUE

        WHERE id = ?`,

        [propertyId]
    );
};

const updatePropertyCommission =
async (propertyId, commissionPercentage) => {

    await pool.query(

        `UPDATE properties

        SET commission_percentage = ?

        WHERE id = ?`,

        [commissionPercentage, propertyId]
    );
};

const deletePropertyByAdmin =
async (propertyId) => {

    await pool.query(

        `DELETE FROM properties

        WHERE id = ?`,

        [propertyId]
    );
};

const getCommissionById =
async (commissionId) => {

    const [rows] =
    await pool.query(

        `SELECT *

        FROM admin_commissions

        WHERE id = ?

        LIMIT 1`,

        [commissionId]
    );

    return rows[0];
};

const updateCommissionRequestTimestamp =
async (commissionId) => {

    await pool.query(

        `UPDATE admin_commissions

        SET payment_requested_at = NOW()

        WHERE id = ?
        AND payment_status = 'PENDING'`,

        [commissionId]
    );
};

const updateCommissionPaidStatus =
async (commissionId, paymentProofNotes) => {

    await pool.query(

        `UPDATE admin_commissions

        SET
            payment_status = 'PAID',
            paid_at = NOW(),
            payment_confirmed_at = NOW(),
            payment_proof_notes = ?

        WHERE id = ?`,

        [paymentProofNotes || null, commissionId]
    );
};

const getPendingCommissionsByOwner =
async (ownerId) => {

    const [rows] =
    await pool.query(

        `SELECT *

        FROM admin_commissions

        WHERE owner_id = ?
        AND payment_status = 'PENDING'

        ORDER BY earned_at DESC`,

        [ownerId]
    );

    return rows;
};

const getUserById =
async (userId) => {

    return pool.query(

        `SELECT * FROM users WHERE id = ? LIMIT 1`,

        [userId]
    );
};

const getRecentWalletCredits =
async () => {

    const [rows] =
    await pool.query(
        `SELECT wt.*, w.user_id, w.wallet_type
        FROM wallet_transactions wt
        JOIN wallets w ON wt.wallet_id = w.id
        WHERE wt.transaction_type = 'CREDIT'
          AND wt.description LIKE 'Admin credit:%'
        ORDER BY wt.created_at DESC
        LIMIT 50`
    );

    return rows;
};

module.exports = {

    getDashboardStats,

    getPendingOwnerApplications,

    getAllUsers,

    updateOwnerApplication,

    updateUserRole,

    getPendingProperties,

    updatePropertyStatus,

    getAllBookings,

    getRefundBookings,

    getMonthlyRevenue,

    getRefundAnalytics,

    getBookingStatusAnalytics,

    getTopPerformingProperties,

    getOwnerPerformance,

    getPlatformKPIs,

    getApprovedOwners,

    getAllProperties,

    getPropertyById,

    deactivatePropertyByAdmin,

    activatePropertyByAdmin,

    deletePropertyByAdmin,

    updatePropertyCommission,

    getCommissionById,

    updateCommissionRequestTimestamp,

    updateCommissionPaidStatus,

    getPendingCommissionsByOwner,

    getUserById,

    getRecentWalletCredits
};

