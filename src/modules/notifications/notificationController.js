const notificationService =
    require("./notificationService");



const getMyNotifications =
    async (req, res, next) => {

        try {

            const notifications =
                await notificationService
                    .getNotifications(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: notifications
            });

        } catch (error) {

            next(error);
        }
};

const markNotificationRead =
    async (req, res, next) => {

        try {

            const {
                notificationId
            } = req.params;

            const result =
                await notificationService
                    .markAsRead(

                        notificationId,

                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

module.exports = {

    getMyNotifications,

    markNotificationRead
};