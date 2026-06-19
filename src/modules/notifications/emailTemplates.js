const wrapInPremiumLayout = (title, content, preheaderText = "") => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #f7f9fa;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                color: #334155;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #f7f9fa;
                padding-bottom: 40px;
                padding-top: 40px;
            }
            .main-card {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                border-top: 5px solid #C49B45;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            .header {
                text-align: center;
                padding: 30px 20px;
                border-bottom: 1px solid #f1f5f9;
            }
            .logo {
                font-size: 28px;
                font-weight: 800;
                color: #1e293b;
                letter-spacing: -0.5px;
                text-decoration: none;
            }
            .logo-gold {
                color: #C49B45;
            }
            .content {
                padding: 40px 35px;
                line-height: 1.6;
                font-size: 15px;
            }
            .footer {
                text-align: center;
                padding: 24px;
                background-color: #f8fafc;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
            }
            .btn {
                display: inline-block;
                padding: 14px 30px;
                margin: 20px 0;
                background-color: #C49B45;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                text-align: center;
                font-size: 14px;
            }
            .info-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: #f8fafc;
                border-radius: 8px;
                overflow: hidden;
            }
            .info-table td {
                padding: 12px 16px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
            }
            .info-table tr:last-child td {
                border-bottom: none;
            }
            .info-table td.label {
                font-weight: 600;
                color: #64748b;
                width: 40%;
            }
            .info-table td.value {
                color: #0f172a;
                font-weight: 500;
                text-align: right;
            }
            .highlight-box {
                background-color: #fffbeb;
                border-left: 4px solid #f59e0b;
                padding: 16px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
                color: #b45309;
            }
            .badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .badge-success { background-color: #d1fae5; color: #065f46; }
            .badge-warning { background-color: #fef3c7; color: #92400e; }
            .badge-danger { background-color: #fee2e2; color: #991b1b; }
            .badge-info { background-color: #e0f2fe; color: #0369a1; }
        </style>
    </head>
    <body>
        ${preheaderText ? `<span style="display:none;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheaderText}</span>` : ''}
        <div class="wrapper">
            <div class="main-card">
                <div class="header">
                    <a href="https://aponghar.in" class="logo">Apon<span class="logo-gold">Ghar</span></a>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p style="margin: 0 0 8px 0;">Need help? Contact us at <a href="mailto:support@aponghar.in" style="color: #C49B45; text-decoration: none;">support@aponghar.in</a></p>
                    <p style="margin: 0;">&copy; 2026 AponGhar. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const bookingConfirmationTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Confirmed!</h2>
        <p>Hello ${data.name},</p>
        <p>Pack your bags! Your booking has been officially confirmed by the owner of <strong>${data.property_name}</strong>.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #065f46;">
            Your booking is <strong>CONFIRMED</strong>. We have attached your official booking voucher. Please show it at the property upon check-in.
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Stay Information</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || ""}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || ""}</td></tr>
            <tr><td class="label">Guest</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
            <tr><td class="label">Total Paid</td><td class="value" style="color: #C49B45; font-weight: 700;">INR ${data.total_amount}</td></tr>
        </table>
        
        <p>Have a wonderful stay! If you need anything else, feel free to check your booking details or contact the host.</p>
    `;
    return wrapInPremiumLayout("Booking Confirmed - AponGhar", content, `Your stay at ${data.property_name} is confirmed!`);
};

const bookingFileTemplate = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Voucher - ${data.booking_code}</title>
        <style>
            body {
                font-family: 'Plus Jakarta Sans', Arial, sans-serif;
                color: #1e293b;
                margin: 0;
                padding: 40px;
                background-color: #ffffff;
            }
            .voucher-container {
                max-width: 800px;
                margin: 0 auto;
                border: 2px solid #C49B45;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            }
            .header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 20px;
            }
            .logo {
                font-size: 28px;
                font-weight: 800;
                color: #1e293b;
                letter-spacing: -0.5px;
            }
            .logo-gold {
                color: #C49B45;
            }
            .title-badge {
                text-align: right;
            }
            .badge-confirmed {
                background-color: #d1fae5;
                color: #065f46;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 14px;
                text-transform: uppercase;
                display: inline-block;
            }
            .details-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .details-table td {
                padding: 14px 20px;
                border: 1px solid #f1f5f9;
                font-size: 15px;
            }
            .details-table td.label {
                font-weight: bold;
                background-color: #f8fafc;
                color: #475569;
                width: 30%;
            }
            .details-table td.value {
                color: #0f172a;
            }
            .footer-note {
                margin-top: 30px;
                text-align: center;
                font-size: 13px;
                color: #64748b;
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="voucher-container">
            <table class="header-table">
                <tr>
                    <td class="logo">Apon<span class="logo-gold">Ghar</span></td>
                    <td class="title-badge">
                        <span class="badge-confirmed">CONFIRMED VOUCHER</span>
                    </td>
                </tr>
            </table>
            
            <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 20px;">Stay Details</h2>
            <table class="details-table">
                <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
                <tr><td class="label">Property Name</td><td class="value"><strong>${data.property_name}</strong></td></tr>
                <tr><td class="label">Room Assigned</td><td class="value">${data.room_name || "Room"}</td></tr>
                <tr><td class="label">Stay Type</td><td class="value">${data.booking_type || "NIGHTLY"}</td></tr>
                <tr><td class="label">Check-in Date</td><td class="value">${data.check_in} ${data.check_in_time || ""}</td></tr>
                <tr><td class="label">Check-out Date</td><td class="value">${data.check_out} ${data.check_out_time || ""}</td></tr>
                <tr><td class="label">Primary Customer</td><td class="value">${data.name}</td></tr>
                <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
                <tr><td class="label">Guest Email</td><td class="value">${data.guest_email || data.email}</td></tr>
                <tr><td class="label">Guest Age</td><td class="value">${data.guest_age || "Not provided"}</td></tr>
                <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
                <tr><td class="label">Total Amount Paid</td><td class="value" style="color: #C49B45; font-weight: bold;">INR ${data.total_amount}</td></tr>
            </table>
            
            <div class="footer-note">
                <p>Please present this booking voucher in print or digital format upon check-in.</p>
                <p>&copy; 2026 AponGhar. All rights reserved. For support, contact support@aponghar.in</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const paymentSuccessTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Payment Successful</h2>
        <p>Hello ${data.name},</p>
        <p>We have successfully received your payment for booking <strong>${data.booking_code}</strong>. Thank you for your payment.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #166534;">
            <strong>Payment ID:</strong> ${data.payment_id}<br/>
            <strong>Amount Paid:</strong> INR ${data.amount}<br/>
            <strong>Status:</strong> Successful
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Payment Details</h3>
        <table class="info-table">
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method || "ONLINE"}</td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Transaction Date</td><td class="value">${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
        </table>
    `;
    return wrapInPremiumLayout("Payment Successful - AponGhar", content, `Payment receipt for booking ${data.booking_code}.`);
};

const otpVerificationTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Verify Your Email Address</h2>
        <p>Hello ${data.name || 'Valued Guest'},</p>
        <p>Thank you for choosing AponGhar. Please use the verification code below to complete your sign-up process. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #C49B45; font-family: monospace;">${data.otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this verification code, please ignore this email or contact support if you have security concerns.</p>
    `;
    return wrapInPremiumLayout("Email Verification - AponGhar", content, "Verify your email address to get started with AponGhar.");
};

const passwordResetTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Reset Your Password</h2>
        <p>Hello ${data.name || 'Valued Guest'},</p>
        <p>We received a request to reset your password for your AponGhar account. Click the button below to set a new password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" class="btn" style="color: #ffffff; text-decoration: none;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="font-size: 12px; color: #C49B45; word-break: break-all;"><a href="${data.resetLink}" style="color: #C49B45;">${data.resetLink}</a></p>
        <p style="color: #64748b; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
    `;
    return wrapInPremiumLayout("Reset Your Password - AponGhar", content, "Set a new password for your AponGhar account.");
};

const bookingRequestGuestTemplate = (data) => {
    const checkInDate = data.check_in;
    const checkOutDate = data.check_out;
    const paymentStatusBadge = data.payment_method === "OFFLINE" 
        ? `<span class="badge badge-warning">Pay at Hotel</span>` 
        : `<span class="badge badge-info">Pending Payment Verification</span>`;

    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Request Received</h2>
        <p>Hello ${data.name},</p>
        <p>Thank you for submitting your booking request. We have notified the property owner, and they will review your request shortly.</p>
        
        <div class="highlight-box">
            Your booking is currently <strong>PENDING APPROVAL</strong>. We will notify you by email as soon as the owner confirms your booking.
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Stay Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${checkInDate} ${data.check_in_time || ""}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${checkOutDate} ${data.check_out_time || ""}</td></tr>
            <tr><td class="label">Guest</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Payment Status</td><td class="value">${paymentStatusBadge}</td></tr>
            <tr><td class="label">Total Amount</td><td class="value" style="color: #C49B45; font-weight: 700;">INR ${data.total_amount}</td></tr>
        </table>
    `;
    return wrapInPremiumLayout("Booking Request Submitted - AponGhar", content, `Your booking request for ${data.property_name} has been received.`);
};

const bookingRequestOwnerTemplate = (data) => {
    const dashboardUrl = `${data.frontendBaseUrl || 'https://aponghar-frontend.onrender.com'}/owner/bookings.html`;
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">New Booking Request</h2>
        <p>Hello,</p>
        <p>You have received a new booking request on your property, <strong>${data.property_name}</strong>. Please review it and confirm or reject it in your dashboard.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Request Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.name}</td></tr>
            <tr><td class="label">Guest Email</td><td class="value">${data.email}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || ""}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || ""}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
            <tr><td class="label">Your Net Earning</td><td class="value" style="color: #059669; font-weight: 700;">INR ${data.net_earning}</td></tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" class="btn" style="color: #ffffff; text-decoration: none;">Review Booking Request</a>
        </div>
    `;
    return wrapInPremiumLayout("New Booking Request received - AponGhar", content, `New booking request from ${data.name} for ${data.property_name}.`);
};

const bookingConfirmedOwnerTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Confirmed</h2>
        <p>Hello,</p>
        <p>A booking on your property <strong>${data.property_name}</strong> has been successfully confirmed.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Booking Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Guest Email</td><td class="value">${data.guest_email || data.email}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || ""}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || ""}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
            <tr><td class="label">Your Net Earning</td><td class="value" style="color: #059669; font-weight: 700;">INR ${data.net_earning}</td></tr>
        </table>

        <p>Please make sure the room is ready and in excellent condition for the guest's check-in.</p>
    `;
    return wrapInPremiumLayout("Booking Confirmed for property - AponGhar", content, `Booking ${data.booking_code} for your property has been confirmed.`);
};

const bookingRejectedGuestTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Request Update</h2>
        <p>Hello ${data.name},</p>
        <p>We regret to inform you that your booking request for <strong>${data.property_name}</strong> could not be accepted by the owner.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #991b1b;">
            <strong>Status:</strong> Declined<br/>
            ${data.reason ? `<strong>Reason:</strong> ${data.reason}<br/>` : ''}
            <strong>Refund Status:</strong> All payment details/amounts have been reverted to your AponGhar wallet (if deducted).
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Cancelled Request Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Total Amount</td><td class="value">INR ${data.total_amount}</td></tr>
        </table>
        
        <p>We apologize for the inconvenience. You can browse other available properties on AponGhar to find a suitable stay.</p>
    `;
    return wrapInPremiumLayout("Booking Request Rejected - AponGhar", content, `Your booking request for ${data.property_name} was declined.`);
};

const bookingCancelledGuestTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Cancelled Successfully</h2>
        <p>Hello ${data.name},</p>
        <p>This email confirms that your booking for <strong>${data.property_name}</strong> has been cancelled.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #334155;">
            <strong>Booking Code:</strong> ${data.booking_code}<br/>
            <strong>Status:</strong> Cancelled & Refunded<br/>
            ${data.refund_amount > 0 ? `<strong>Refunded Amount:</strong> INR ${data.refund_amount} (Credited to your AponGhar wallet)` : 'No gateway/wallet refund was applicable.'}
        </div>

        <p>We hope to host you again in the future! You can use your wallet balance to book any other property on AponGhar at any time.</p>
    `;
    return wrapInPremiumLayout("Booking Cancelled - AponGhar", content, `Your booking ${data.booking_code} was successfully cancelled.`);
};

const bookingCancelledOwnerTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Booking Cancelled by Guest</h2>
        <p>Hello,</p>
        <p>We want to inform you that the guest <strong>${data.name}</strong> has cancelled their booking for your property <strong>${data.property_name}</strong>.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Cancellation Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out}</td></tr>
        </table>

        <div class="highlight-box">
            The room inventory has been released and is now open for new booking requests. Any pending earnings related to this booking have been reversed.
        </div>
    `;
    return wrapInPremiumLayout("Alert: Booking Cancelled - AponGhar", content, `Booking ${data.booking_code} for your property was cancelled.`);
};

const ownerEarningUnlockedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Earning Unlocked</h2>
        <p>Hello ${data.name},</p>
        <p>Great news! A guest has checked in, and your earning for booking <strong>${data.reference_id}</strong> has been unlocked and credited to your wallet balance.</p>
        
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.reference_id}</strong></td></tr>
            <tr><td class="label">Credited Amount</td><td class="value" style="color: #059669; font-weight: 700;">+ INR ${data.amount}</td></tr>
            <tr><td class="label">New Wallet Balance</td><td class="value">INR ${data.balance}</td></tr>
            <tr><td class="label">Description</td><td class="value">${data.description}</td></tr>
        </table>
        <p>You can request a withdrawal of these funds to your bank account at any time from your dashboard.</p>
    `;
    return wrapInPremiumLayout("Earning Unlocked - AponGhar", content, `Earning for booking ${data.reference_id} has been credited to your wallet.`);
};

const withdrawalRequestedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Withdrawal Request Submitted</h2>
        <p>Hello ${data.name},</p>
        <p>Your request to withdraw **INR ${data.amount}** from your AponGhar wallet has been successfully submitted and is currently pending review by our administrator.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Payout Details</h3>
        <table class="info-table">
            <tr><td class="label">Amount Requested</td><td class="value" style="color: #ef4444; font-weight: 700;">INR ${data.amount}</td></tr>
            ${data.upi_id ? `<tr><td class="label">UPI ID</td><td class="value">${data.upi_id}</td></tr>` : ''}
            ${data.account_number ? `
            <tr><td class="label">Bank Name</td><td class="value">${data.bank_name}</td></tr>
            <tr><td class="label">Account Holder</td><td class="value">${data.account_holder_name}</td></tr>
            <tr><td class="label">Account Number</td><td class="value">••••${data.account_number.slice(-4)}</td></tr>
            <tr><td class="label">IFSC Code</td><td class="value">${data.ifsc_code}</td></tr>
            ` : ''}
        </table>
        <p>We usually process withdrawals within 24-48 business hours. We will email you as soon as the status of your request changes.</p>
    `;
    return wrapInPremiumLayout("Withdrawal Request Submitted - AponGhar", content, `Withdrawal request for INR ${data.amount} has been received.`);
};

const withdrawalApprovedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Withdrawal Approved</h2>
        <p>Hello ${data.name},</p>
        <p>We are pleased to inform you that your withdrawal request of **INR ${data.amount}** has been approved by the administrator.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #166534;">
            <strong>Status:</strong> Approved & Processing<br/>
            <strong>Amount:</strong> INR ${data.amount}<br/>
            ${data.admin_notes ? `<strong>Notes:</strong> ${data.admin_notes}` : ''}
        </div>
        <p>The funds are now being transferred to your payout destination. You will receive another notification once the transaction is completed.</p>
    `;
    return wrapInPremiumLayout("Withdrawal Request Approved - AponGhar", content, `Your withdrawal request for INR ${data.amount} has been approved.`);
};

const withdrawalPaidTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Withdrawal Completed</h2>
        <p>Hello ${data.name},</p>
        <p>Success! Your withdrawal of **INR ${data.amount}** has been successfully disbursed and marked as paid.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #065f46;">
            <strong>Status:</strong> Paid / Completed<br/>
            <strong>Disbursed Amount:</strong> INR ${data.amount}<br/>
            ${data.admin_notes ? `<strong>Reference/Notes:</strong> ${data.admin_notes}` : ''}
        </div>
        <p>Please check your bank account or UPI destination within the next few hours to confirm receipt. Thank you for listing with AponGhar!</p>
    `;
    return wrapInPremiumLayout("Withdrawal Disbursed Successfully - AponGhar", content, `Your withdrawal of INR ${data.amount} has been disbursed.`);
};

const withdrawalRejectedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700;">Withdrawal Request Update</h2>
        <p>Hello ${data.name},</p>
        <p>We want to inform you that your withdrawal request of **INR ${data.amount}** could not be processed and has been rejected by the administrator.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #991b1b;">
            <strong>Status:</strong> Rejected<br/>
            <strong>Amount:</strong> INR ${data.amount}<br/>
            <strong>Reason:</strong> ${data.admin_notes || 'Invalid payment details or bank rejection.'}
        </div>
        
        <p><strong>Note:</strong> The requested amount of **INR ${data.amount}** has been returned back to your AponGhar wallet balance. Please check your bank/UPI details and submit a new request if needed.</p>
    `;
    return wrapInPremiumLayout("Withdrawal Request Rejected - AponGhar", content, `Your withdrawal request for INR ${data.amount} was rejected.`);
};

module.exports = {
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
};
