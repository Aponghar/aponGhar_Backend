const bookingRepository =
    require("./bookingRepository");

const roomRepository =
    require("../rooms/roomRepository");

const roomService =
    require("../rooms/roomService");

const propertyRepository =
    require("../properties/propertyRepository");

const notificationService =
    require("../notifications/notificationService");

const authRepository =
    require("../auth/authRepository");

const couponService =
    require("../coupons/couponService");

const financeRepository =
    require("../finance/financeRepository");

const couponRepository =
    require("../coupons/couponRepository");

const {
    calculateBookingPricing,
    toMoney
} = require("../../utils/pricing");


const generateBookingCode =
    () => {

        return `BK-${Date.now()}`;
};

const formatDateOnly =
    (value) => {

        const date =
            new Date(value);

        if (Number.isNaN(date.getTime())) {

            return value;
        }

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;
};

const getHourlyDuration =
    (pricingOption) => {

        if (pricingOption === "HOUR_3") {
            return 3;
        }

        if (pricingOption === "HOUR_6") {
            return 6;
        }

        if (pricingOption === "HOUR_9") {
            return 9;
        }

        return 0;
};

const addHoursToTime =
    (
        time,
        hours
    ) => {

        if (!time || hours <= 0) {
            return null;
        }

        const [
            hour,
            minute
        ] = time.split(":")
            .map(Number);

        const totalMinutes =
            (hour * 60) +
            minute +
            (hours * 60);

        const nextHour =
            Math.floor(totalMinutes / 60) % 24;

        const nextMinute =
            totalMinutes % 60;

        return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
};

const getInventoryEndDate =
    (booking) => {

        if (
            booking.booking_type === "HOURLY" &&
            formatDateOnly(booking.check_in_date) ===
                formatDateOnly(booking.check_out_date)
        ) {

            const checkIn =
                new Date(booking.check_in_date);

            return new Date(
                checkIn.getTime() +
                (24 * 60 * 60 * 1000)
            );
        }

        return booking.check_out_date;
};

const getRoomPrice =
    (
        room,
        pricingOption
    ) => {

        const priceMap = {
            PER_NIGHT: room.price_per_night,
            HOUR_3: room.price_3hours,
            HOUR_6: room.price_6hours,
            HOUR_9: room.price_9hours,
            BASE: room.base_price
        };

        return toMoney(priceMap[pricingOption]) ||
            toMoney(room.price_per_night) ||
            toMoney(room.base_price);
};

const safeCreateNotification =
    async (notificationData) => {

        try {

            await notificationService
                .createNotification(
                    notificationData
                );

        } catch (error) {

            console.error(
                "Notification failed:",
                error.message
            );
        }
};

const safeSendBookingConfirmation =
    async (emailData) => {

        try {

            await notificationService
                .sendBookingConfirmation(
                    emailData
                );

        } catch (error) {

            console.error(
                "Booking email failed:",
                error.message
            );
        }
};

const safeSendBookingRequestGuest = async (emailData) => {
    try {
        await notificationService.sendBookingRequestToGuest(emailData);
    } catch (error) {
        console.error("Booking request email to guest failed:", error.message);
    }
};

const safeSendBookingRequestOwner = async (emailData) => {
    try {
        await notificationService.sendBookingRequestToOwner(emailData);
    } catch (error) {
        console.error("Booking request email to owner failed:", error.message);
    }
};

const safeSendBookingConfirmationOwner = async (emailData) => {
    try {
        await notificationService.sendBookingConfirmationToOwner(emailData);
    } catch (error) {
        console.error("Booking confirmation email to owner failed:", error.message);
    }
};

const safeSendBookingCancellationToGuest = async (emailData) => {
    try {
        await notificationService.sendBookingCancellationToGuest(emailData);
    } catch (error) {
        console.error("Booking cancellation email to guest failed:", error.message);
    }
};

const safeSendBookingCancellationToOwner = async (emailData) => {
    try {
        await notificationService.sendBookingCancellationToOwner(emailData);
    } catch (error) {
        console.error("Booking cancellation email to owner failed:", error.message);
    }
};

const safeSendBookingRejectionToGuest = async (emailData) => {
    try {
        await notificationService.sendBookingRejectionToGuest(emailData);
    } catch (error) {
        console.error("Booking rejection email to guest failed:", error.message);
    }
};

const ensureUserWallet =
    async (userId) => {

        let wallet =
            await financeRepository
                .getWalletByUserId(
                    userId
                );

        if (wallet) {

            return wallet;
        }

        await financeRepository
            .createWallet(

                userId,

                "USER"
            );

        wallet =
            await financeRepository
                .getWalletByUserId(
                    userId
                );

        return wallet;
};

const refundBookingToWallet =
    async (booking) => {

        const walletRefund =
            toMoney(
                booking.wallet_used
            );

        const gatewayRefund =
            booking.payment_status === "PAID"
                ? toMoney(
                    booking.gateway_paid
                )
                : 0;

        const refundAmount =
            walletRefund +
            gatewayRefund;

        if (refundAmount <= 0) {

            return {

                refundAmount: 0
            };
        }

        const wallet =
            await ensureUserWallet(
                booking.user_id
            );

        const balanceBefore =
            toMoney(wallet.balance);

        const balanceAfter =
            balanceBefore +
            refundAmount;

        await financeRepository
            .updateWalletBalance(

                wallet.id,

                balanceAfter
            );

        await financeRepository
            .createTransaction({

                wallet_id:
                    wallet.id,

                transaction_type:
                    "REFUND",

                amount:
                    refundAmount,

                balance_before:
                    balanceBefore,

                balance_after:
                    balanceAfter,

                reference_id:
                    booking.booking_code,

                description:
                    "Refund credited for cancelled booking"
            });

        return {

            refundAmount,

            balanceAfter
        };
};



const createBooking =
    async (
        userId,
        bookingData
    ) => {

        const {

            room_id,

            booking_type = "NIGHTLY",

            pricing_option = "PER_NIGHT",

            check_in_date,

            check_in_time,

            check_out_date,

            check_out_time,

            guests,

            booked_rooms,

            guest_name,

            guest_email,

            guest_age,

            customer_name,

            payment_method = "OFFLINE",

            special_requests

        } = bookingData;

        // GET ROOM
        const room =
            await roomRepository
                .getRoomById(room_id);

        if (!room) {

            throw new Error(
                "Room not found"
            );
        }

        // VALIDATE BOOKING TYPE MATCHES ROOM PRICE TYPE
        if (room.price_type === "PER_NIGHT" && booking_type === "HOURLY") {
            throw new Error("This room does not support hourly bookings");
        }
        if (room.price_type === "HOURLY" && booking_type !== "HOURLY") {
            throw new Error("This room only supports hourly bookings");
        }

        // VALIDATE OPERATIONAL HOURS FOR HOURLY BOOKINGS
        if (booking_type === "HOURLY") {
            const property = await propertyRepository.getPropertyById(room.property_id);
            if (property) {
                const parseTimeToMinutesLocal = (timeStr, isCheckOut = false) => {
                    if (!timeStr) return isCheckOut ? 1440 : 0;
                    const parts = timeStr.split(":");
                    const h = parseInt(parts[0], 10) || 0;
                    const m = parseInt(parts[1], 10) || 0;
                    if (isCheckOut && h === 0 && m === 0) {
                        return 1440;
                    }
                    return h * 60 + m;
                };

                const checkInMins = parseTimeToMinutesLocal(check_in_time, false);
                const durationHours = getHourlyDuration(pricing_option);
                const checkOutMins = checkInMins + (durationHours * 60);

                const propCheckInMins = parseTimeToMinutesLocal(property.check_in_time, false);
                const propCheckOutMins = parseTimeToMinutesLocal(property.check_out_time, true);

                if (checkInMins < propCheckInMins) {
                    const readableTime = property.check_in_time ? property.check_in_time.slice(0, 5) : "00:00";
                    throw new Error(`Check-in time must be at or after ${readableTime} for this property`);
                }

                if (checkOutMins > propCheckOutMins) {
                    const readableTime = property.check_out_time ? property.check_out_time.slice(0, 5) : "24:00";
                    throw new Error(`Check-out time must be at or before ${readableTime} for this property`);
                }
            }
        }

        // GUEST VALIDATION
        const guestCapacity =
            toMoney(room.max_adults) +
            toMoney(room.max_children);

        if (
            guests > guestCapacity
        ) {

            throw new Error(
                "Guest limit exceeded"
            );
        }

        // CALCULATE STAY
        const checkIn =
            new Date(check_in_date);

        const checkOut =
            new Date(check_out_date);

        let totalUnits =
            Math.ceil(

                (
                    checkOut - checkIn
                ) / (1000 * 60 * 60 * 24)
            );

        if (booking_type === "HOURLY") {

            totalUnits = 1;
        }

        if (totalUnits <= 0) {

            throw new Error(
                "Invalid booking dates"
            );
        }

        // TOTAL PRICE
        const roomBasePrice =
            getRoomPrice(
                room,
                pricing_option
            );

        if (roomBasePrice <= 0) {

            throw new Error(
                "Room price not configured"
            );
        }

        const pricing =
            calculateBookingPricing({

                unitBasePrice:
                    roomBasePrice,

                units:
                    totalUnits,

                rooms:
                    booked_rooms,

                commissionPercentage:
                    room.commission_percentage
            });

        const totalAmount =
            pricing.total_amount;

        // FINAL PAYABLE
        let finalAmount =
            totalAmount;

        // COUPON
        let appliedCoupon = null;

        let couponDiscount = 0;

        // WALLET
        let walletUsed = 0;

        // APPLY COUPON
        if (bookingData.coupon_code) {

            const coupon =
                await couponService
                    .validateCoupon(

                        bookingData.coupon_code,

                        room.property_id,

                        totalAmount,

                        userId
                    );

            couponDiscount =

                couponService
                    .calculateCouponDiscount(

                        coupon,

                        totalAmount
                    );

            finalAmount =
                totalAmount -
                couponDiscount;

            appliedCoupon =
                coupon;
        }

        // USE WALLET
        if (
            bookingData.use_wallet === true
        ) {

            const wallet =
                await financeRepository
                    .getWalletByUserId(
                        userId
                    );

            if (

                wallet &&

                wallet.balance > 0
            ) {

                walletUsed = Math.min(

                    Number(wallet.balance),

                    finalAmount
                );

                finalAmount =
                    finalAmount -
                    walletUsed;
            }
        }

        const inventoryEndDate =
            booking_type === "HOURLY" &&
            formatDateOnly(check_in_date) === formatDateOnly(check_out_date)
                ? new Date(
                    checkIn.getTime() +
                    (24 * 60 * 60 * 1000)
                )
                : check_out_date;

        // LOCK INVENTORY
        await roomService
            .lockRoomInventory(

                room_id,

                check_in_date,

                inventoryEndDate,

                booked_rooms
            );

        // CREATE BOOKING
        const bookingCode =
            generateBookingCode();

        const booking =
            await bookingRepository
                .createBooking({

                    booking_code:
                        bookingCode,

                    user_id:
                        userId,

                    room_id,

                    property_id:
                        room.property_id,

                    check_in_date:
                        formatDateOnly(check_in_date),

                    check_in_time,

                    check_out_date:
                        formatDateOnly(check_out_date),

                    check_out_time:
                        booking_type === "HOURLY"
                            ? addHoursToTime(
                                check_in_time,
                                getHourlyDuration(pricing_option)
                            )
                            : check_out_time,

                    guests,

                    booked_rooms,

                    booking_type,

                    pricing_option,

                    guest_name,

                    guest_email,

                    guest_age,

                    customer_name,

                    total_amount:
                        totalAmount,

                    booking_base_amount:
                        pricing.booking_base_amount,

                    booking_commission_percentage:
                        pricing.booking_commission_percentage,

                    booking_commission_amount:
                        pricing.booking_commission_amount,

                    booking_unit_base_price:
                        pricing.unit_base_price,

                    booking_unit_selling_price:
                        pricing.unit_selling_price,

                    coupon_id:

                        appliedCoupon
                            ? appliedCoupon.id
                            : null,

                    coupon_discount:
                        couponDiscount,

                    wallet_used:
                        walletUsed,

                    gateway_paid:
                        finalAmount,

                    payment_method,

                    special_requests
                });

        // WALLET DEDUCTION
        if (walletUsed > 0) {

            const wallet =
                await financeRepository
                    .getWalletByUserId(
                        userId
                    );

            const balanceBefore =
                Number(wallet.balance);

            const balanceAfter =

                balanceBefore -
                walletUsed;



            // UPDATE WALLET
            await financeRepository
                .updateWalletBalance(

                    wallet.id,

                    balanceAfter
                );



            // CREATE LEDGER ENTRY
            await financeRepository
                .createTransaction({

                    wallet_id:
                        wallet.id,

                    transaction_type:
                        "BOOKING_PAYMENT",

                    amount:
                        walletUsed,

                    balance_before:
                        balanceBefore,

                    balance_after:
                        balanceAfter,

                    reference_id:
                        bookingCode,

                    description:
                        "Wallet used for booking"
                });
        }
        // TRACK COUPON USAGE
        if (appliedCoupon) {

            await couponRepository
                .incrementCouponUsage(
                    appliedCoupon.id
                );



            await couponRepository
                .createCouponUsage({

                    coupon_id:
                        appliedCoupon.id,

                    user_id:
                        userId,

                    booking_id:
                        booking.insertId,

                    discount_amount:
                        couponDiscount
                });
        }

        const property =
            await propertyRepository
                .getPropertyById(
                    room.property_id
                );

        if (property?.owner_id) {

            await safeCreateNotification({

                user_id:
                    property.owner_id,

                title:
                    "New Booking Request",

                message:
                    `${customer_name} requested ${booking_type.toLowerCase()} booking ${bookingCode}.`,

                notification_type:
                    "BOOKING"
            });

            // Send premium email notifications
            try {
                const user = await authRepository.findUserById(userId);
                const owner = await authRepository.findUserById(property.owner_id);
                const emailData = {
                    email: guest_email || user?.email || "",
                    name: customer_name || user?.full_name || "",
                    guest_name: guest_name || customer_name || user?.full_name || "",
                    guest_email: guest_email || user?.email || "",
                    guest_age: guest_age,
                    booking_code: bookingCode,
                    property_name: property?.property_name || "AponGhar Property",
                    room_name: room?.room_name,
                    booking_type: booking_type,
                    check_in: formatDateOnly(check_in_date),
                    check_in_time: check_in_time,
                    check_out: formatDateOnly(check_out_date),
                    check_out_time: check_out_time,
                    payment_method: payment_method,
                    total_amount: totalAmount,
                    net_earning: toMoney(pricing.booking_base_amount - pricing.booking_commission_amount),
                    frontendBaseUrl: process.env.FRONTEND_URL || "https://aponghar.in"
                };

                if (payment_method === "OFFLINE") {
                    safeSendBookingRequestGuest(emailData);
                    if (owner?.email) {
                        safeSendBookingRequestOwner({
                            ...emailData,
                            email: owner.email
                        });
                    }
                } else if (payment_method === "ONLINE") {
                    safeSendBookingRequestGuest(emailData);
                }
            } catch (err) {
                console.error("Failed to send booking request emails:", err.message);
            }
        }

        return {

            booking_id:
                booking.insertId,

            booking_code:
                bookingCode,

            total_amount:
                totalAmount,

            booking_base_amount:
                pricing.booking_base_amount,

            booking_commission_percentage:
                pricing.booking_commission_percentage,

            booking_commission_amount:
                pricing.booking_commission_amount,

            coupon_discount:
                couponDiscount,

            wallet_used:
                walletUsed,

            gateway_paid:
                finalAmount,

            status:
                "PENDING",

            payment_method,

            message:
                payment_method === "OFFLINE"
                    ? "Booking request sent to owner for approval"
                    : "Booking created. Continue to online payment"
        };
};

const confirmBooking =
    async (
        bookingId,
        actor = { system: true }
    ) => {

        const booking =
            await bookingRepository
                .getBookingById(
                    bookingId
                );

        if (!booking) {

            throw new Error(
                "Booking not found"
            );
        }

        const property =
            await propertyRepository
                .getPropertyById(
                    booking.property_id
                );

        if (
            !actor.system &&
            actor.role !== "ADMIN" &&
            property?.owner_id !== actor.userId
        ) {

            throw new Error(
                "Only the property owner can confirm this booking"
            );
        }

        if (
            booking.booking_status !==
            "PENDING"
        ) {

            throw new Error(
                "Only pending bookings can be confirmed"
            );
        }

        await bookingRepository
            .updateBookingStatus(

                bookingId,

                "CONFIRMED",

                booking.payment_method === "OFFLINE"
                    ? "PENDING"
                    : "PAID"
            );
        // INCREASE PROPERTY POPULARITY
        await propertyRepository
            .incrementPropertyBookings(
                booking.property_id
            );
        // GET USER
        const user =
            await authRepository
                .findUserById(
                    booking.user_id
                );

        const bookingDetails =
            await bookingRepository
                .getBookingDetails(
                    bookingId
                );

        // SEND EMAIL (run in background to avoid request timeouts)
        safeSendBookingConfirmation({

                email:
                    booking.guest_email ||
                    user?.email ||
                    "",

                name:
                    booking.customer_name ||
                    user?.full_name ||
                    "",

                guest_name:
                    booking.guest_name,

                guest_email:
                    booking.guest_email,

                guest_age:
                    booking.guest_age,

                booking_code:
                    booking.booking_code,

                property_name:
                    property?.property_name ||
                    "AponGhar Property",

                room_name:
                    bookingDetails?.room_name,

                booking_type:
                    booking.booking_type,

                check_in:
                    formatDateOnly(
                        booking.check_in_date
                    ),

                check_in_time:
                    booking.check_in_time,

                check_out:
                    formatDateOnly(
                        booking.check_out_date
                    ),

                check_out_time:
                    booking.check_out_time,

                payment_method:
                    booking.payment_method,

                total_amount:
                    booking.total_amount
            });

        // Send booking confirmation email to property owner
        try {
            const owner = property?.owner_id ? await authRepository.findUserById(property.owner_id) : null;
            if (owner?.email) {
                safeSendBookingConfirmationOwner({
                    email: owner.email,
                    name: owner.full_name || "Owner",
                    guest_name: booking.guest_name || booking.customer_name || user?.full_name || "",
                    guest_email: booking.guest_email || user?.email || "",
                    booking_code: booking.booking_code,
                    property_name: property?.property_name || "AponGhar Property",
                    room_name: bookingDetails?.room_name,
                    check_in: formatDateOnly(booking.check_in_date),
                    check_in_time: booking.check_in_time,
                    check_out: formatDateOnly(booking.check_out_date),
                    check_out_time: booking.check_out_time,
                    payment_method: booking.payment_method,
                    total_amount: booking.total_amount,
                    net_earning: toMoney(booking.booking_base_amount - booking.booking_commission_amount)
                });
            }
        } catch (err) {
            console.error("Failed to send owner booking confirmation email:", err.message);
        }

        // CREATE NOTIFICATION
        await safeCreateNotification({

                user_id:
                    booking.user_id,

                title:
                    "Booking Confirmed",

            message:
                `Your booking ${booking.booking_code} has been confirmed by the owner.`,

                notification_type:
                    "BOOKING"
            });    

        return {

            message:
                "Booking confirmed successfully"
        };
};

const rejectBooking =
    async (
        actor,
        bookingId,
        reason = null
    ) => {

        const booking =
            await bookingRepository
                .getBookingById(
                    bookingId
                );

        if (!booking) {

            throw new Error(
                "Booking not found"
            );
        }

        const property =
            await propertyRepository
                .getPropertyById(
                    booking.property_id
                );

        if (
            actor.role !== "ADMIN" &&
            property?.owner_id !== actor.userId
        ) {

            throw new Error(
                "Only the property owner can reject this booking"
            );
        }

        if (
            booking.booking_status !== "PENDING"
        ) {

            throw new Error(
                "Only pending bookings can be rejected"
            );
        }

        await roomService
            .releaseRoomInventory(

                booking.room_id,

                booking.check_in_date,

                getInventoryEndDate(booking),

                booking.booked_rooms
            );

        await refundBookingToWallet(
            booking
        );

        if (booking.coupon_id) {
            await couponRepository.decrementCouponUsage(booking.coupon_id);
            await couponRepository.deleteCouponUsageByBookingId(bookingId);
        }

        await bookingRepository
            .rejectBooking(

                bookingId,

                reason
            );

        await safeCreateNotification({

            user_id:
                booking.user_id,

            title:
                "Booking Rejected",

            message:
                `Your booking ${booking.booking_code} was rejected by the owner.`,

            notification_type:
                "BOOKING"
        });

        // Send rejection email to guest
        try {
            const user = await authRepository.findUserById(booking.user_id);
            const room = await roomRepository.getRoomById(booking.room_id);
            safeSendBookingRejectionToGuest({
                email: booking.guest_email || user?.email || "",
                name: booking.customer_name || user?.full_name || "",
                booking_code: booking.booking_code,
                property_name: property?.property_name || "AponGhar Property",
                room_name: room?.room_name || "Room",
                total_amount: booking.total_amount,
                reason: reason
            });
        } catch (err) {
            console.error("Failed to send booking rejection email:", err.message);
        }

        return {

            message:
                "Booking rejected successfully"
        };
};

const cancelBooking =
    async (
        userId,
        bookingId
    ) => {

        const booking =
            await bookingRepository
                .getBookingById(
                    bookingId
                );

        if (!booking) {

            throw new Error(
                "Booking not found"
            );
        }

        // SECURITY CHECK
        if (
            booking.user_id !== userId
        ) {

            throw new Error(
                "Unauthorized cancellation"
            );
        }

        // PREVENT DOUBLE CANCEL
        if (
            booking.booking_status ===
            "CANCELLED"
        ) {

            throw new Error(
                "Booking already cancelled"
            );
        }

        const hasActiveCheckIn =
            await bookingRepository
                .hasActiveCheckIn(
                    bookingId
                );

        if (hasActiveCheckIn) {

            throw new Error(
                "Booking cannot be cancelled after check-in is completed"
            );
        }

        // RELEASE INVENTORY
        await roomService
            .releaseRoomInventory(

                booking.room_id,

                booking.check_in_date,

                getInventoryEndDate(booking),

                booking.booked_rooms
            );

        // UPDATE STATUS
        const refund =
            await refundBookingToWallet(
                booking
            );

        if (booking.coupon_id) {
            await couponRepository.decrementCouponUsage(booking.coupon_id);
            await couponRepository.deleteCouponUsageByBookingId(bookingId);
        }

        try {
            const financeService = require("../finance/financeService");
            await financeService.reverseOwnerEarning(bookingId);
        } catch (err) {
            console.error("Failed to reverse owner earning on cancellation:", err.message);
        }

        await bookingRepository
            .updateBookingStatus(

                bookingId,

                "CANCELLED",

                "REFUNDED"
            );

        // Send cancellation emails to guest and owner
        try {
            const user = await authRepository.findUserById(booking.user_id);
            const property = await propertyRepository.getPropertyById(booking.property_id);
            const owner = property?.owner_id ? await authRepository.findUserById(property.owner_id) : null;
            const room = await roomRepository.getRoomById(booking.room_id);

            safeSendBookingCancellationToGuest({
                email: booking.guest_email || user?.email || "",
                name: booking.customer_name || user?.full_name || "",
                booking_code: booking.booking_code,
                property_name: property?.property_name || "AponGhar Property",
                refund_amount: refund.refundAmount || 0,
                balanceAfter: refund.balanceAfter
            });

            if (owner?.email) {
                safeSendBookingCancellationToOwner({
                    email: owner.email,
                    name: owner.full_name || "Owner",
                    guest_name: booking.guest_name || booking.customer_name || user?.full_name || "",
                    property_name: property?.property_name || "AponGhar Property",
                    booking_code: booking.booking_code,
                    room_name: room?.room_name || "Room",
                    check_in: formatDateOnly(booking.check_in_date),
                    check_out: formatDateOnly(booking.check_out_date)
                });
            }
        } catch (err) {
            console.error("Failed to send booking cancellation emails:", err.message);
        }

        return {

            message:
                refund.refundAmount > 0
                    ? "Booking cancelled and refund credited to wallet"
                    : "Booking cancelled successfully",

            refund_amount:
                refund.refundAmount || 0,

            wallet_balance:
                refund.balanceAfter
        };
};

const cancelFailedOnlinePayment =
    async (
        userId,
        bookingId,
        reason = "Online payment failed"
    ) => {

        const booking =
            await bookingRepository
                .getBookingById(
                    bookingId
                );

        if (!booking) {

            throw new Error(
                "Booking not found"
            );
        }

        if (
            booking.user_id !== userId
        ) {

            throw new Error(
                "Unauthorized payment access"
            );
        }

        if (
            booking.booking_status ===
            "CANCELLED"
        ) {

            return {
                message:
                    "Booking already cancelled",
                payment_status:
                    booking.payment_status
            };
        }

        if (
            booking.payment_status ===
            "PAID"
        ) {

            throw new Error(
                "Paid bookings cannot be marked as failed"
            );
        }

        await roomService
            .releaseRoomInventory(

                booking.room_id,

                booking.check_in_date,

                getInventoryEndDate(booking),

                booking.booked_rooms
            );

        const refund =
            await refundBookingToWallet(
                booking
            );

        if (booking.coupon_id) {
            await couponRepository.decrementCouponUsage(booking.coupon_id);
            await couponRepository.deleteCouponUsageByBookingId(bookingId);
        }

        await bookingRepository
            .updateBookingStatus(

                bookingId,

                "CANCELLED",

                "FAILED"
            );

        await safeCreateNotification({

            user_id:
                booking.user_id,

            title:
                "Payment Failed",

            message:
                `Payment for booking ${booking.booking_code} was not completed. The booking was cancelled.`,

            notification_type:
                "BOOKING_PAYMENT"
        });

        return {
            message:
                reason,
            refund_amount:
                refund.refundAmount || 0,
            wallet_balance:
                refund.balanceAfter,
            payment_status:
                "FAILED"
        };
};

const getMyBookings =
    async (userId) => {

        return bookingRepository
            .getUserBookings(
                userId
            );
};

const getPropertyBookings =
    async (ownerId) => {

        return bookingRepository
            .getOwnerBookings(
                ownerId
            );
};

const getBookingInfo =
    async (
        ownerId,
        bookingId
    ) => {

        const booking =
            await bookingRepository
                .getBookingDetails(
                    bookingId
                );

        if (!booking) {

            throw new Error(
                "Booking not found"
            );
        }

        // SECURITY CHECK
        const property =
            await propertyRepository
                .getPropertyById(
                    booking.property_id
                );

        if (
            property.owner_id !== ownerId
        ) {

            throw new Error(
                "Unauthorized access"
            );
        }

        return booking;
};

module.exports = {

    createBooking,

    confirmBooking,

    rejectBooking,

    cancelBooking,

    cancelFailedOnlinePayment,

    getMyBookings,

    getPropertyBookings,

    getBookingInfo
};
