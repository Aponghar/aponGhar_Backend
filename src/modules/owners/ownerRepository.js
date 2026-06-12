const pool = require("../../config/db");



const createOwnerApplication =
    async (applicationData) => {

        const {
            user_id,
            property_name,
            property_type,
            location,
            area,
            owner_name,
            contact_number,
            description
        } = applicationData;

        const [result] = await pool.query(

            `INSERT INTO owner_applications
            (
                user_id,
                property_name,
                property_type,
                location,
                area,
                owner_name,
                contact_number,
                description
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                user_id,
                property_name,
                property_type,
                location,
                area,
                owner_name,
                contact_number,
                description
            ]
        );

        return result;
};



const findApplicationByUserId =
    async (userId) => {

        const [rows] = await pool.query(

            `SELECT * FROM owner_applications
            WHERE user_id = ?`,

            [userId]
        );

        return rows[0];
};

const getAllApplications =
    async () => {

        const [rows] = await pool.query(

            `SELECT 
                oa.*,
                u.email,
                u.phone

            FROM owner_applications oa

            JOIN users u
            ON oa.user_id = u.id

            ORDER BY oa.created_at DESC`
        );

        return rows;
};
const getApplicationById =
    async (applicationId) => {

        const [rows] = await pool.query(

            `SELECT * FROM owner_applications
            WHERE id = ?`,

            [applicationId]
        );

        return rows[0];
};
const updateApplicationStatus =
    async (
        applicationId,
        status,
        adminMessage
    ) => {

        await pool.query(

            `UPDATE owner_applications

            SET
                status = ?,
                admin_message = ?

            WHERE id = ?`,

            [
                status,
                adminMessage,
                applicationId
            ]
        );
};

const updateUserRole =
    async (userId, role) => {

        await pool.query(

            `UPDATE users
            SET role = ?
            WHERE id = ?`,

            [role, userId]
        );

        await pool.query(

            `UPDATE wallets
            SET wallet_type = ?
            WHERE user_id = ?`,

            [
                role === "OWNER"
                    ? "OWNER"
                    : "USER",
                userId
            ]
        );
};

module.exports = {
    createOwnerApplication,
    findApplicationByUserId,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    updateUserRole
};
