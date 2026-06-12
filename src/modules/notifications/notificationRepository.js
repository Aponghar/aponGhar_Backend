const pool =
    require("../../config/db");

const {

    emitToUser

} = require("../../config/socket");



const createNotification =
    async (notificationData) => {

        const {

            user_id,

            title,

            message,

            notification_type

        } = notificationData;

        const [notification] =
            await pool.query(

                `INSERT INTO notifications (

                    user_id,

                    title,

                    message,

                    notification_type

                )

                VALUES (?, ?, ?, ?)`,

                [

                    user_id,

                    title,

                    message,

                    notification_type
                ]
            );

        // REAL-TIME SOCKET EVENT
        emitToUser(

            notificationData.user_id,

            "new_notification",

            {

                title:
                    notificationData.title,

                message:
                    notificationData.message,

                notification_type:
                    notificationData.notification_type
            }
        );

        return notification;
};
const getUserNotifications =
    async (userId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM notifications

            WHERE user_id = ?

            ORDER BY created_at DESC`,

            [userId]
        );

        return rows;
};

const markNotificationRead =
    async (
        notificationId,
        userId
    ) => {

        await pool.query(

            `UPDATE notifications

            SET is_read = TRUE

            WHERE id = ?
            AND user_id = ?`,

            [
                notificationId,
                userId
            ]
        );
};

module.exports = {

    createNotification,

    getUserNotifications,

    markNotificationRead
};
