const resend = require("../../config/email");
const notificationRepository = require("./notificationRepository");

const {
    bookingConfirmationTemplate,
    bookingFileTemplate,
    paymentSuccessTemplate,
    otpVerificationTemplate,
    passwordResetTemplate,
    bookingRequestGuestTemplate,
    bookingRequestOwnerTemplate,
    bookingConfirmedOwnerTemplate,
    bookingRejectedGuestTemplate,
    bookingCancelledGuestTemplate,
    bookingCancelledOwnerTemplate,
    ownerEarningUnlockedTemplate,
    withdrawalRequestedTemplate,
    withdrawalApprovedTemplate,
    withdrawalPaidTemplate,
    withdrawalRejectedTemplate
} = require("./emailTemplates");

const { emitToUser } = require("../../config/socket");

const sendEmail = async (to, subject, html) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "AponGhar <noreply@aponghar.in>",
        to,
        subject,
        html
    });
    if (error) {
        throw new Error(error.message);
    }
};

const createNotification = async (notificationData) => {
    return notificationRepository.createNotification(notificationData);
};

const sendVerificationOTP = async (emailData) => {
    const html = otpVerificationTemplate(emailData);
    await sendEmail(emailData.email, "Email Verification - AponGhar", html);
};

const sendPasswordReset = async (emailData) => {
    const html = passwordResetTemplate(emailData);
    await sendEmail(emailData.email, "Reset Password - AponGhar", html);
};

const sendBookingRequestToGuest = async (emailData) => {
    const html = bookingRequestGuestTemplate(emailData);
    await sendEmail(emailData.email, "Booking Request Submitted - AponGhar", html);
};

const sendBookingRequestToOwner = async (emailData) => {
    const html = bookingRequestOwnerTemplate(emailData);
    await sendEmail(emailData.email, "Action Required: New Booking Request - AponGhar", html);
};

const sendBookingConfirmation = async (emailData) => {
    const html = bookingConfirmationTemplate(emailData);
    const bookingFile = bookingFileTemplate(emailData);

    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "AponGhar <noreply@aponghar.in>",
        to: emailData.email,
        subject: "Booking Confirmed - AponGhar",
        html,
        attachments: [
            {
                filename: `${emailData.booking_code}.html`,
                content: Buffer.from(bookingFile)
            }
        ]
    });
    if (error) {
        throw new Error(error.message);
    }
};

const sendBookingConfirmationToOwner = async (emailData) => {
    const html = bookingConfirmedOwnerTemplate(emailData);
    await sendEmail(emailData.email, "Booking Confirmed for property - AponGhar", html);
};

const sendBookingCancellationToGuest = async (emailData) => {
    const html = bookingCancelledGuestTemplate(emailData);
    await sendEmail(emailData.email, "Booking Cancelled - AponGhar", html);
};

const sendBookingCancellationToOwner = async (emailData) => {
    const html = bookingCancelledOwnerTemplate(emailData);
    await sendEmail(emailData.email, "Alert: Booking Cancelled - AponGhar", html);
};

const sendBookingRejectionToGuest = async (emailData) => {
    const html = bookingRejectedGuestTemplate(emailData);
    await sendEmail(emailData.email, "Booking Request Rejected - AponGhar", html);
};

const sendPaymentSuccess = async (emailData) => {
    const html = paymentSuccessTemplate(emailData);
    await sendEmail(emailData.email, "Payment Successful - AponGhar", html);
};

const sendOwnerEarningUnlocked = async (emailData) => {
    const html = ownerEarningUnlockedTemplate(emailData);
    await sendEmail(emailData.email, `Earning Unlocked: INR ${emailData.amount} - AponGhar`, html);
};

const sendWithdrawalRequested = async (emailData) => {
    const html = withdrawalRequestedTemplate(emailData);
    await sendEmail(emailData.email, "Withdrawal Request Submitted - AponGhar", html);
};

const sendWithdrawalApproved = async (emailData) => {
    const html = withdrawalApprovedTemplate(emailData);
    await sendEmail(emailData.email, "Withdrawal Request Approved - AponGhar", html);
};

const sendWithdrawalPaid = async (emailData) => {
    const html = withdrawalPaidTemplate(emailData);
    await sendEmail(emailData.email, "Withdrawal Disbursed Successfully - AponGhar", html);
};

const sendWithdrawalRejected = async (emailData) => {
    const html = withdrawalRejectedTemplate(emailData);
    await sendEmail(emailData.email, "Withdrawal Request Rejected - AponGhar", html);
};

const getNotifications = async (userId) => {
    return notificationRepository.getUserNotifications(userId);
};

const markAsRead = async (notificationId, userId) => {
    await notificationRepository.markNotificationRead(notificationId, userId);
    return {
        message: "Notification marked as read"
    };
};

module.exports = {
    sendEmail,
    createNotification,
    sendVerificationOTP,
    sendPasswordReset,
    sendBookingRequestToGuest,
    sendBookingRequestToOwner,
    sendBookingConfirmation,
    sendBookingConfirmationToOwner,
    sendBookingCancellationToGuest,
    sendBookingCancellationToOwner,
    sendBookingRejectionToGuest,
    sendPaymentSuccess,
    sendOwnerEarningUnlocked,
    sendWithdrawalRequested,
    sendWithdrawalApproved,
    sendWithdrawalPaid,
    sendWithdrawalRejected,
    getNotifications,
    markAsRead
};
