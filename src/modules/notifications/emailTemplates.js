const bookingConfirmationTemplate =
    (data) => {

        return `
        <h2>Booking Confirmed</h2>
        <p>Hello ${data.name},</p>
        <p>Your booking has been confirmed by the property owner.</p>

        <hr />

        <p>Booking Code: <strong>${data.booking_code}</strong></p>
        <p>Property: ${data.property_name}</p>
        <p>Room: ${data.room_name || "Room"}</p>
        <p>Check In: ${data.check_in} ${data.check_in_time || ""}</p>
        <p>Check Out: ${data.check_out} ${data.check_out_time || ""}</p>
        <p>Guest: ${data.guest_name || data.name}${data.guest_age ? ` (${data.guest_age} years)` : ""}</p>
        <p>Payment Method: ${data.payment_method || "OFFLINE"}</p>
        <p>Total Amount: INR ${data.total_amount}</p>

        <hr />

        <p>Please show the attached booking file when you arrive.</p>
        `;
};

const bookingFileTemplate =
    (data) => {

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Booking ${data.booking_code}</title>
            <style>
                body { font-family: Arial, sans-serif; color: #172033; padding: 24px; }
                h1 { color: #0b573e; }
                table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                td { border: 1px solid #e1efe8; padding: 10px; }
                td:first-child { font-weight: bold; background: #f0f7f3; width: 34%; }
            </style>
        </head>
        <body>
            <h1>AponGhar Booking File</h1>
            <table>
                <tr><td>Booking Code</td><td>${data.booking_code}</td></tr>
                <tr><td>Property</td><td>${data.property_name}</td></tr>
                <tr><td>Room</td><td>${data.room_name || "Room"}</td></tr>
                <tr><td>Booking Type</td><td>${data.booking_type || "NIGHTLY"}</td></tr>
                <tr><td>Check-in</td><td>${data.check_in} ${data.check_in_time || ""}</td></tr>
                <tr><td>Check-out</td><td>${data.check_out} ${data.check_out_time || ""}</td></tr>
                <tr><td>Customer Name</td><td>${data.name}</td></tr>
                <tr><td>Guest Name</td><td>${data.guest_name || data.name}</td></tr>
                <tr><td>Guest Email</td><td>${data.guest_email || data.email}</td></tr>
                <tr><td>Guest Age</td><td>${data.guest_age || "Not provided"}</td></tr>
                <tr><td>Payment Method</td><td>${data.payment_method || "OFFLINE"}</td></tr>
                <tr><td>Total Amount</td><td>INR ${data.total_amount}</td></tr>
            </table>
        </body>
        </html>
        `;
};

const paymentSuccessTemplate =
    (data) => {

        return `
        <h2>Payment Successful</h2>
        <p>Hello ${data.name},</p>
        <p>Your payment has been received successfully.</p>
        <p>Payment ID: ${data.payment_id}</p>
        <p>Amount: INR ${data.amount}</p>
        `;
};

module.exports = {

    bookingConfirmationTemplate,

    bookingFileTemplate,

    paymentSuccessTemplate
};
