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
                background-color: #f8fafc;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                color: #334155;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #f8fafc;
                padding-bottom: 40px;
                padding-top: 40px;
            }
            .main-card {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                border-top: 4px solid #C49B45;
                box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
                overflow: hidden;
            }
            .header {
                text-align: center;
                padding: 30px 20px;
                background-color: #ffffff;
                border-bottom: 1px solid #f1f5f9;
            }
            .logo-img {
                max-width: 140px;
                height: auto;
                display: block;
                margin: 0 auto;
                border-radius: 6px;
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
                padding: 13px 28px;
                margin: 20px 0;
                background-color: #C49B45;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
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
                border: 1px solid #e2e8f0;
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
                color: #475569;
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
                border-radius: 6px;
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
                    <img src="https://aponghar.in/assets/logo-full.jpg" alt="AponGhar Logo" class="logo-img" onerror="this.style.display='none'; document.getElementById('text-logo').style.display='block';">
                    <div id="text-logo" style="display:none; font-size:26px; font-weight:800; color:#1e293b; letter-spacing:-0.5px;">
                        Apon<span style="color:#C49B45;">Ghar</span>
                    </div>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p style="margin: 0 0 8px 0;">Need assistance? Contact our team at <a href="mailto:support@aponghar.in" style="color: #C49B45; text-decoration: none; font-weight: 600;">support@aponghar.in</a></p>
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
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🎉 Booking Confirmed!</h2>
        <p>Hello ${data.name},</p>
        <p>Excellent news! Your stay at <strong>${data.property_name}</strong> has been officially confirmed by the host.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #065f46;">
            <strong>Booking Confirmed</strong><br/>
            We have generated your official stay receipt. We have attached a professional <strong>PDF Booking Voucher</strong> to this email. Please carry a copy of this PDF (printed or digital) when you arrive at the property.
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">🏨 Stay Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || "12:00 PM"}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || "11:00 AM"}</td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
            <tr><td class="label">Total Paid</td><td class="value" style="color: #C49B45; font-weight: 700;">INR ${data.total_amount}</td></tr>
        </table>
        
        <p>Enjoy your homestay experience! If you have any requests (early check-in, dietary requirements), please feel free to reach out to the property owner.</p>
    `;
    return wrapInPremiumLayout("Booking Confirmed - AponGhar", content, `Your stay at ${data.property_name} is confirmed!`);
};

const bookingFileTemplate = (data) => {
    // Keep this fallback HTML voucher in case it's ever needed, but we will primary use the PDF generator.
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Booking Voucher - ${data.booking_code}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #1e293b; padding: 30px; }
            .card { border: 2px solid #C49B45; border-radius: 8px; padding: 30px; }
            .header { border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 10px; border: 1px solid #f1f5f9; }
            td.label { font-weight: bold; background: #f8fafc; width: 35%; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h2>AponGhar Stay Voucher</h2>
            </div>
            <table>
                <tr><td class="label">Booking Code</td><td>${data.booking_code}</td></tr>
                <tr><td class="label">Property Name</td><td>${data.property_name}</td></tr>
                <tr><td class="label">Room</td><td>${data.room_name || "Room"}</td></tr>
                <tr><td class="label">Check In</td><td>${data.check_in}</td></tr>
                <tr><td class="label">Check Out</td><td>${data.check_out}</td></tr>
                <tr><td class="label">Guest Name</td><td>${data.guest_name || data.name}</td></tr>
                <tr><td class="label">Amount Paid</td><td>INR ${data.total_amount}</td></tr>
            </table>
        </div>
    </body>
    </html>
    `;
};

const paymentSuccessTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🧾 Payment Receipt</h2>
        <p>Hello ${data.name},</p>
        <p>We have successfully received your payment for booking <strong>${data.booking_code}</strong>. Thank you for your payment.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #166534;">
            <strong>Transaction Successful</strong><br/>
            <strong>Payment ID:</strong> ${data.payment_id}<br/>
            <strong>Amount Paid:</strong> INR ${data.amount}
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">💳 Transaction Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property Name</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method || "ONLINE"}</td></tr>
            <tr><td class="label">Transaction Date</td><td class="value">${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
        </table>
    `;
    return wrapInPremiumLayout("Payment Successful - AponGhar", content, `Payment receipt for booking ${data.booking_code}.`);
};

const otpVerificationTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🔑 Verify Your Email</h2>
        <p>Hello ${data.name || 'Valued Guest'},</p>
        <p>Thank you for choosing AponGhar. Please use the verification code below to complete your sign-up process. This code is valid for 10 minutes.</p>
        
        <div style="text-align: center; margin: 30px 0; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #C49B45; font-family: monospace;">${data.otpCode}</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px;">If you did not request this verification code, please ignore this email or contact support if you have security concerns.</p>
    `;
    return wrapInPremiumLayout("Email Verification - AponGhar", content, "Verify your email address to get started with AponGhar.");
};

const passwordResetTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🔒 Reset Password Request</h2>
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
    const paymentStatusBadge = data.payment_method === "OFFLINE" 
        ? `<span class="badge badge-warning">Pay at Hotel</span>` 
        : `<span class="badge badge-info">Pending Payment</span>`;

    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">📝 Booking Request Submitted</h2>
        <p>Hello ${data.name},</p>
        <p>Thank you for submitting your booking request. We have notified the host of the property and they will review your stay request shortly.</p>
        
        <div class="highlight-box">
            <strong>Reservation Status: Pending Approval</strong><br/>
            Your request is currently being reviewed. We will email you your confirmed stay voucher as soon as the host confirms the booking.
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">🏨 Stay Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || "12:00 PM"}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || "11:00 AM"}</td></tr>
            <tr><td class="label">Guest</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Payment Status</td><td class="value">${paymentStatusBadge}</td></tr>
            <tr><td class="label">Total Amount</td><td class="value" style="color: #C49B45; font-weight: 700;">INR ${data.total_amount}</td></tr>
        </table>
    `;
    return wrapInPremiumLayout("Booking Request Submitted - AponGhar", content, `Your booking request for ${data.property_name} has been received.`);
};

const bookingRequestOwnerTemplate = (data) => {
    const dashboardUrl = `${data.frontendBaseUrl || 'https://aponghar.in'}/owner/bookings.html`;
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🔔 Action Required: New Booking Request</h2>
        <p>Hello,</p>
        <p>You have received a new booking request on your property, <strong>${data.property_name}</strong>. Please review it and confirm or reject it in your host dashboard.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Stay Request Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.name}</td></tr>
            <tr><td class="label">Guest Email</td><td class="value">${data.email}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || "12:00 PM"}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || "11:00 AM"}</td></tr>
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
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">✅ Booking Confirmed Notification</h2>
        <p>Hello,</p>
        <p>A booking on your property <strong>${data.property_name}</strong> has been successfully confirmed. The guest has received their official stay voucher.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Stay Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Guest Email</td><td class="value">${data.guest_email || data.email}</td></tr>
            <tr><td class="label">Room Reserved</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in} ${data.check_in_time || "12:00 PM"}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out} ${data.check_out_time || "11:00 AM"}</td></tr>
            <tr><td class="label">Payment Method</td><td class="value">${data.payment_method}</td></tr>
            <tr><td class="label">Your Net Earning</td><td class="value" style="color: #059669; font-weight: 700;">INR ${data.net_earning}</td></tr>
        </table>

        <p>Please ensure that the room is prepared and ready for the guest's check-in.</p>
    `;
    return wrapInPremiumLayout("Booking Confirmed for property - AponGhar", content, `Booking ${data.booking_code} for your property has been confirmed.`);
};

const bookingRejectedGuestTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">❌ Booking Request Status: Declined</h2>
        <p>Hello ${data.name},</p>
        <p>We regret to inform you that your booking request for <strong>${data.property_name}</strong> could not be accepted by the host.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #991b1b;">
            <strong>Request Status: Declined</strong><br/>
            ${data.reason ? `<strong>Reason:</strong> ${data.reason}<br/>` : ''}
            <strong>Refund Status:</strong> Any wallet balances used or online checkout amounts charged have been automatically reverted to your AponGhar wallet balance.
        </div>

        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Reservation Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Property</td><td class="value">${data.property_name}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Total Amount</td><td class="value">INR ${data.total_amount}</td></tr>
        </table>
        
        <p>We apologize for the inconvenience. You can use your refunded wallet balance to request a stay at other available properties on AponGhar.</p>
    `;
    return wrapInPremiumLayout("Booking Request Rejected - AponGhar", content, `Your booking request for ${data.property_name} was declined.`);
};

const bookingCancelledGuestTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🛑 Booking Cancelled</h2>
        <p>Hello ${data.name},</p>
        <p>This email confirms that your booking reservation for <strong>${data.property_name}</strong> has been cancelled.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #334155;">
            <strong>Cancellation Receipt</strong><br/>
            <strong>Booking Code:</strong> ${data.booking_code}<br/>
            <strong>Status:</strong> Cancelled & Refunded<br/>
            ${data.refund_amount > 0 ? `<strong>Refunded Amount:</strong> INR ${data.refund_amount} (credited back to your AponGhar wallet)` : 'No wallet/gateway refund was applicable.'}
        </div>

        <p>We look forward to hosting you in the future. You can browse other homestays and make bookings using your wallet balance at any time.</p>
    `;
    return wrapInPremiumLayout("Booking Cancelled - AponGhar", content, `Your booking ${data.booking_code} was successfully cancelled.`);
};

const bookingCancelledOwnerTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🛑 Alert: Booking Cancelled by Guest</h2>
        <p>Hello,</p>
        <p>We want to inform you that the guest <strong>${data.name}</strong> has cancelled their booking reservation for your property <strong>${data.property_name}</strong>.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">Cancelled Stay Details</h3>
        <table class="info-table">
            <tr><td class="label">Booking Code</td><td class="value"><strong>${data.booking_code}</strong></td></tr>
            <tr><td class="label">Guest Name</td><td class="value">${data.guest_name || data.name}</td></tr>
            <tr><td class="label">Room Type</td><td class="value">${data.room_name || "Room"}</td></tr>
            <tr><td class="label">Check In</td><td class="value">${data.check_in}</td></tr>
            <tr><td class="label">Check Out</td><td class="value">${data.check_out}</td></tr>
        </table>

        <div class="highlight-box" style="background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b;">
            The room inventory lock has been automatically released. The room is now available for new reservations. Any pending payouts for this booking have been reversed.
        </div>
    `;
    return wrapInPremiumLayout("Alert: Booking Cancelled - AponGhar", content, `Booking ${data.booking_code} for your property was cancelled.`);
};

const ownerEarningUnlockedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">💰 Wallet Credited: Earning Unlocked</h2>
        <p>Hello ${data.name},</p>
        <p>Great news! A guest has checked in, and your net earnings for booking <strong>${data.reference_id}</strong> have been unlocked and credited as available balance in your host wallet.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">📈 Earnings Ledger</h3>
        <table class="info-table">
            <tr><td class="label">Booking Reference</td><td class="value"><strong>${data.reference_id}</strong></td></tr>
            <tr><td class="label">Earning Credited</td><td class="value" style="color: #059669; font-weight: 700;">+ INR ${data.amount}</td></tr>
            <tr><td class="label">New Available Balance</td><td class="value" style="font-weight: 700;">INR ${data.balance}</td></tr>
            <tr><td class="label">Description</td><td class="value">${data.description}</td></tr>
        </table>
        <p>You can request a withdrawal of these funds directly to your verified bank account or UPI address from your host dashboard.</p>
    `;
    return wrapInPremiumLayout("Earning Unlocked - AponGhar", content, `Earning for booking ${data.reference_id} has been credited to your wallet.`);
};

const withdrawalRequestedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🏧 Payout Request Submitted</h2>
        <p>Hello ${data.name},</p>
        <p>Your request to withdraw **INR ${data.amount}** from your AponGhar host wallet has been successfully submitted and is currently pending review by our administrator.</p>
        
        <h3 style="color: #0f172a; font-size: 16px; margin-top: 25px; margin-bottom: 10px; font-weight: 700;">💸 Payout Details</h3>
        <table class="info-table">
            <tr><td class="label">Amount Requested</td><td class="value" style="color: #ef4444; font-weight: 700;">INR ${data.amount}</td></tr>
            ${data.upi_id ? `<tr><td class="label">UPI Payout ID</td><td class="value">${data.upi_id}</td></tr>` : ''}
            ${data.account_number ? `
            <tr><td class="label">Bank Name</td><td class="value">${data.bank_name}</td></tr>
            <tr><td class="label">Account Holder</td><td class="value">${data.account_holder_name}</td></tr>
            <tr><td class="label">Account Number</td><td class="value">••••${data.account_number.slice(-4)}</td></tr>
            <tr><td class="label">IFSC Code</td><td class="value">${data.ifsc_code}</td></tr>
            ` : ''}
        </table>
        <p>Payout requests are usually processed within 24-48 business hours. We will email you once your payout status updates.</p>
    `;
    return wrapInPremiumLayout("Withdrawal Request Submitted - AponGhar", content, `Withdrawal request for INR ${data.amount} has been received.`);
};

const withdrawalApprovedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🟢 Payout Request Approved</h2>
        <p>Hello ${data.name},</p>
        <p>We are pleased to inform you that your withdrawal request of **INR ${data.amount}** has been approved by the administrator.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #166534;">
            <strong>Payout Status: Processing</strong><br/>
            <strong>Approved Amount:</strong> INR ${data.amount}<br/>
            ${data.admin_notes ? `<strong>Notes:</strong> ${data.admin_notes}` : ''}
        </div>
        <p>The funds are now being transferred to your registered bank account or UPI destination. We will notify you once the transfer is cleared.</p>
    `;
    return wrapInPremiumLayout("Withdrawal Request Approved - AponGhar", content, `Your withdrawal request for INR ${data.amount} has been approved.`);
};

const withdrawalPaidTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">✔️ Payout Disbursed Successfully</h2>
        <p>Hello ${data.name},</p>
        <p>Success! Your withdrawal of **INR ${data.amount}** has been successfully disbursed and marked as paid.</p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #065f46;">
            <strong>Payout Status: Disbursed / Completed</strong><br/>
            <strong>Amount:</strong> INR ${data.amount}<br/>
            ${data.admin_notes ? `<strong>Reference:</strong> ${data.admin_notes}` : ''}
        </div>
        <p>Please check your bank account or UPI wallet within the next few hours to confirm credit. Thank you for hosting with AponGhar!</p>
    `;
    return wrapInPremiumLayout("Withdrawal Disbursed Successfully - AponGhar", content, `Your withdrawal of INR ${data.amount} has been disbursed.`);
};

const withdrawalRejectedTemplate = (data) => {
    const content = `
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">🔴 Payout Request Declined</h2>
        <p>Hello ${data.name},</p>
        <p>We want to inform you that your withdrawal request of **INR ${data.amount}** could not be processed and has been declined by the administrator.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #991b1b;">
            <strong>Payout Status: Declined</strong><br/>
            <strong>Amount:</strong> INR ${data.amount}<br/>
            <strong>Decline Reason:</strong> ${data.admin_notes || 'Invalid payment details or bank network rejection.'}
        </div>
        
        <p><strong>Note:</strong> The requested amount of **INR ${data.amount}** has been automatically returned to your available AponGhar wallet balance. Please check your bank/UPI information and submit a new request if needed.</p>
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
