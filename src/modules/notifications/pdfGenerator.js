const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

/**
 * Generates a luxury-branded vector PDF booking voucher on the fly.
 * @param {Object} data Booking info payload
 * @returns {Promise<Buffer>} Resolves to a binary PDF file Buffer.
 */
const generateVoucherPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });
            const buffers = [];
            
            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // 1. Draw a thin golden frame around the document page
            doc.strokeColor("#C49B45").lineWidth(1).rect(25, 25, 545, 791).stroke();

            // 2. Load the local AponGhar logo image if it exists
            const logoPath = path.join(__dirname, "../../../../frontend/assets/logo-full.jpg");
            let headerY = 45;
            
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, headerY, { width: 140 });
            } else {
                // Fallback elegant styled text logo
                doc.fillColor("#1e293b")
                   .fontSize(24)
                   .font("Helvetica-Bold")
                   .text("Apon", 50, headerY, { continued: true })
                   .fillColor("#C49B45")
                   .text("Ghar");
            }

            // 3. Header title / metadata (right side)
            doc.fillColor("#10b981")
               .fontSize(12)
               .font("Helvetica-Bold")
               .text("CONFIRMED VOUCHER", 380, headerY, { align: "right", width: 165 });
            
            doc.fillColor("#64748b")
               .fontSize(9)
               .font("Helvetica")
               .text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 380, headerY + 18, { align: "right", width: 165 });
               
            doc.text(`Booking: ${data.booking_code}`, 380, headerY + 30, { align: "right", width: 165 });

            // 4. Solid gold divider line
            doc.strokeColor("#C49B45").lineWidth(1.5).moveTo(50, 100).lineTo(545, 100).stroke();

            // 5. Reservation Header
            doc.fillColor("#1e293b")
               .fontSize(14)
               .font("Helvetica-Bold")
               .text("Stay Reservation Details", 50, 120);

            // 6. Stay Details Grid List
            const rows = [
                ["Booking Code", data.booking_code, true],
                ["Property Name", data.property_name, true],
                ["Room Reserved", data.room_name || "Room"],
                ["Stay Type", data.booking_type || "NIGHTLY"],
                ["Check-In Date", `${data.check_in} (from ${data.check_in_time || "12:00 PM"})`],
                ["Check-Out Date", `${data.check_out} (before ${data.check_out_time || "11:00 AM"})`],
                ["Primary Customer", data.name],
                ["Guest Name", data.guest_name || data.name],
                ["Guest Email", data.guest_email || data.email],
                ["Guest Age", data.guest_age || "Not provided"],
                ["Payment Method", data.payment_method],
                ["Total Amount Paid", `INR ${data.total_amount}`, true]
            ];

            let yPos = 145;
            rows.forEach((row, i) => {
                // Background block for alternating rows
                if (i % 2 === 0) {
                    doc.fillColor("#f8fafc").rect(50, yPos - 4, 495, 20).fill();
                }

                // Row label
                doc.fillColor("#475569")
                   .font("Helvetica-Bold")
                   .fontSize(9)
                   .text(row[0], 60, yPos);
                
                // Row value
                const isHighlight = row[0] === "Total Amount Paid";
                doc.fillColor(isHighlight ? "#C49B45" : "#0f172a")
                   .font(row[2] ? "Helvetica-Bold" : "Helvetica")
                   .fontSize(9)
                   .text(String(row[1]), 240, yPos, { width: 290 });

                yPos += 22;
            });

            // 7. Important Guidelines Section
            let infoY = yPos + 15;
            doc.fillColor("#1e293b")
               .fontSize(12)
               .font("Helvetica-Bold")
               .text("Important Guidelines", 50, infoY);
            
            infoY += 18;
            doc.fillColor("#475569").fontSize(8.5).font("Helvetica");
            
            const guidelines = [
                "• Identification: All check-in guests must present a valid government-issued photo ID card (Aadhaar, Passport, DL, Voter ID).",
                "• Safety & Conduct: Standard property rules and check-in/out times must be respected. Early check-in or late check-out is subject to room availability.",
                "• Inquiries: For any modifications, cancellations, or special requests, please contact the host directly or raise a ticket.",
                "• Support: Need assistance? Reach our customer helpline via support.aponghar@gmail.com."
            ];

            guidelines.forEach(line => {
                doc.text(line, 60, infoY, { width: 475 });
                infoY += doc.heightOfString(line, { width: 475 }) + 4;
            });

            // 8. Sign-off / Footer note
            doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(50, 755).lineTo(545, 755).stroke();
            
            doc.fillColor("#94a3b8")
               .fontSize(8)
               .font("Helvetica")
               .text("AponGhar - Luxury Stays & Homestay Management Platform", 50, 768, { align: "center", width: 495 })
               .text("Email: support.aponghar@gmail.com | Web: https://aponghar.in", 50, 780, { align: "center", width: 495 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateVoucherPDF
};
