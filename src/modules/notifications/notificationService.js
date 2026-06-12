const transporter =
    require("../../config/email");

const notificationRepository =
    require("./notificationRepository");

const {

    bookingConfirmationTemplate,

    bookingFileTemplate,

    paymentSuccessTemplate

} = require("./emailTemplates");

const {

    emitToUser

} = require("../../config/socket");



const sendEmail =
    async (
        to,
        subject,
        html
    ) => {

        await transporter.sendMail({

            from:
                process.env.EMAIL_FROM,

            to,

            subject,

            html
        });
};

const createNotification =
    async (notificationData) => {

        return notificationRepository
            .createNotification(
                notificationData
            );
};

const sendBookingConfirmation =
    async (emailData) => {

        const html =
            bookingConfirmationTemplate(
                emailData
            );

        const bookingFile =
            bookingFileTemplate(
                emailData
            );

        await transporter.sendMail({

            from:
                process.env.EMAIL_FROM,

            to:
                emailData.email,

            subject:
                "Booking Confirmed",

            html,

            attachments: [
                {
                    filename:
                        `${emailData.booking_code}.html`,

                    content:
                        bookingFile,

                    contentType:
                        "text/html"
                }
            ]
        });
};


const sendPaymentSuccess =
    async (emailData) => {

        const html =
            paymentSuccessTemplate(
                emailData
            );

        await sendEmail(

            emailData.email,

            "Payment Successful",

            html
        );
};

const getNotifications =
    async (userId) => {

        return notificationRepository
            .getUserNotifications(
                userId
            );
};

const markAsRead =
    async (
        notificationId,
        userId
    ) => {

        await notificationRepository
            .markNotificationRead(

                notificationId,

                userId
            );

        return {

            message:
                "Notification marked as read"
        };
};

module.exports = {

    sendEmail,

    createNotification,

    sendBookingConfirmation,

    sendPaymentSuccess,

    getNotifications,

    markAsRead
};
