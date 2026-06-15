const crypto =
    require("crypto");

const razorpay =
    require("../../config/razorpay");

const bookingRepository =
    require("../bookings/bookingRepository");

const paymentRepository =
    require("./paymentRepository");

const bookingService =
    require("../bookings/bookingService");

const propertyRepository =
    require("../properties/propertyRepository");

const authRepository =
    require("../auth/authRepository");

const financeRepository =
    require("../finance/financeRepository");

const checkinRepository =
    require("../checkins/checkinRepository");

const {
    deriveIncludedCommission,
    toMoney
} = require("../../utils/pricing");

const logger =
    require("../../utils/logger/logger");

const isRazorpayConfigured =
    () => {

        return /^rzp_(test|live)_/i
            .test(process.env.RAZORPAY_KEY_ID || "") &&
            Boolean(process.env.RAZORPAY_KEY_SECRET);
};

const ensureRazorpayConfigured =
    () => {

        if (!isRazorpayConfigured()) {

            throw new Error(
                "Razorpay keys are not configured"
            );
        }
};

const generateRazorpaySignature =
    (
        orderId,
        paymentId
    ) => crypto
        .createHmac(

            "sha256",

            process.env
                .RAZORPAY_KEY_SECRET
        )
        .update(

            `${orderId}|${paymentId}`
        )
        .digest("hex");

const isValidRazorpaySignature =
    (
        orderId,
        paymentId,
        signature
    ) => generateRazorpaySignature(
        orderId,
        paymentId
    ) === signature;

const getPaymentFailureMessage =
    (paymentData = {}) => {

        return paymentData.error?.description ||
            paymentData.error?.reason ||
            paymentData.error?.code ||
            paymentData.reason ||
            "Payment was not completed";
};

const ensureOwnerWallet =
    async (ownerId) => {

        let wallet =
            await financeRepository
                .getWalletByUserId(
                    ownerId
                );

        if (wallet) {

            return wallet;
        }

        await financeRepository
            .createWallet(

                ownerId,

                "OWNER"
            );

        wallet =
            await financeRepository
                .getWalletByUserId(
                    ownerId
                );

        return wallet;
};

const creditOwnerEarning =
    async (booking) => {

        const property =
            await propertyRepository
                .getPropertyById(
                    booking.property_id
                );

        if (!property) {

            throw new Error(
                "Property not found for booking"
            );
        }

        const owner =
            await authRepository
                .findUserById(
                    property.owner_id
                );

        if (!owner) {

            throw new Error(
                "Owner not found for booking"
            );
        }

        const paidAmount =
            toMoney(booking.gateway_paid) +
            toMoney(booking.wallet_used);

        const grossAmount =
            paidAmount > 0
                ? paidAmount
                : toMoney(booking.total_amount) -
                    toMoney(booking.coupon_discount);

        const commissionAmount =
            toMoney(booking.booking_commission_amount) > 0
                ? toMoney(booking.booking_commission_amount)
                : toMoney(property.commission_percentage) > 0
                    ? deriveIncludedCommission(
                        grossAmount,
                        property.commission_percentage
                    ).commissionAmount
                    : 0;

        const earning = {
            grossAmount,
            commissionAmount,
            netEarning:
                Math.max(0, grossAmount - commissionAmount)
        };

        await financeRepository
            .createOwnerEarning({

                owner_id:
                    owner.id,

                booking_id:
                    booking.id,

                property_id:
                    property.id,

                gross_amount:
                    earning.grossAmount,

                commission_percentage:
                    toMoney(
                        booking.booking_commission_percentage ??
                        property.commission_percentage
                    ),

                commission_amount:
                    earning.commissionAmount,

                net_earning:
                    earning.netEarning
            });

        const wallet =
            await ensureOwnerWallet(
                owner.id
            );

        const pendingBefore =
            toMoney(wallet.pending_balance || 0);

        const pendingAfter =
            pendingBefore +
            toMoney(earning.netEarning);

        await financeRepository
            .updatePendingBalance(

                wallet.id,

                pendingAfter
            );
};

const createPaymentOrder =
    async (
        userId,
        bookingId
    ) => {


            try {
        // GET BOOKING
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
                "Unauthorized payment access"
            );
        }

        const payableAmount =
            toMoney(booking.gateway_paid) > 0
                ? toMoney(booking.gateway_paid)
                : toMoney(booking.total_amount);

        if (payableAmount <= 0) {

            await bookingService
                .confirmBooking(
                    booking.id
                );

            const confirmedBooking =
                await bookingRepository
                    .getBookingById(
                        booking.id
                    );

            await creditOwnerEarning(
                confirmedBooking
            );

            return {

                booking_id:
                    booking.id,

                booking_code:
                    booking.booking_code,

                amount:
                    0,

                currency:
                    "INR",

                payment_required:
                    false,

                message:
                    "Booking confirmed using wallet balance"
            };
        }

        if (!isRazorpayConfigured()) {

            if (booking.booking_status === "PENDING") {

                await bookingService
                    .cancelBooking(

                        userId,

                        booking.id
                    );
            }

            throw new Error(
                "Razorpay keys are not configured. The pending booking was cancelled so inventory stays available."
            );
        }

        // CREATE RAZORPAY ORDER
        const razorpayOrder =
            await razorpay.orders.create({

                amount:
                    Math.round(payableAmount * 100),

                currency: "INR",

                receipt:
                    booking.booking_code
            });

        // STORE TRANSACTION
        await paymentRepository
            .createTransaction({

                booking_id:
                    booking.id,

                razorpay_order_id:
                    razorpayOrder.id,

                amount:
                    payableAmount
            });

        return {

            booking_id:
                booking.id,

            booking_code:
                booking.booking_code,

            razorpay_order_id:
                razorpayOrder.id,

            amount:
                payableAmount,

            currency: "INR",

            payment_required:
                true,


            razorpay_key:
                process.env
                    .RAZORPAY_KEY_ID
        };

        } catch (error) {
            const errorMsg = error.message || (error.error && error.error.description) || "Unknown error";
            logger.error(
                `Payment order failed: ${errorMsg}`
            );

            try {
                const booking = await bookingRepository.getBookingById(bookingId);
                if (booking && booking.booking_status === "PENDING") {
                    await bookingService.cancelFailedOnlinePayment(
                        userId,
                        bookingId,
                        `Payment initialization failed: ${errorMsg}`
                    );
                }
            } catch (cancelError) {
                logger.error(
                    `Failed to cancel booking after payment order failure: ${cancelError.message}`
                );
            }

            throw error;
        }
};

const verifyPayment =
    async (
        userId,
        paymentData
    ) => {

        try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            payment_method

        } = paymentData;

        // VERIFY SIGNATURE
        if (
            !isValidRazorpaySignature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )

        ) {

            const failedTransaction =
                await paymentRepository
                    .getTransactionByOrderId(

                        razorpay_order_id
                    );

            if (failedTransaction) {

                await bookingService
                    .cancelFailedOnlinePayment(
                        userId,
                        failedTransaction.booking_id,
                        "Invalid payment signature"
                    );

                await paymentRepository
                    .updateTransaction(

                        razorpay_order_id,

                        razorpay_payment_id,

                        "FAILED",

                        payment_method
                    );
            }

            throw new Error(
                "Invalid payment signature"
            );
        }

        // GET TRANSACTION
        const transaction =
            await paymentRepository
                .getTransactionByOrderId(

                    razorpay_order_id
                );

        if (!transaction) {

            throw new Error(
                "Transaction not found"
            );
        }

        if (transaction.payment_status === "SUCCESS") {

            return {

                message:
                    "Payment already verified",

                booking_id:
                    transaction.booking_id,

                payment_status:
                    "SUCCESS"
            };
        }

        const booking =
            await bookingRepository
                .getBookingById(
                    transaction.booking_id
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

        // UPDATE TRANSACTION
        await paymentRepository
            .updateTransaction(

                razorpay_order_id,

                razorpay_payment_id,

                "SUCCESS",

                payment_method
            );

        // CONFIRM BOOKING
        await bookingService
            .confirmBooking(

                transaction.booking_id
            );

        const confirmedBooking =
            await bookingRepository
                .getBookingById(
                    transaction.booking_id
                );

        await creditOwnerEarning(
            confirmedBooking
        );

        return {

            message:
                "Payment verified successfully",

            booking_id:
                transaction.booking_id,

            payment_status:
                "SUCCESS"
        };
    } catch (error) {

        logger.error(
            `Payment verification failed: ${error.message}`
        );

        throw error;
    }
};

const markPaymentFailed =
    async (
        userId,
        paymentData
    ) => {

        try {

            const {
                razorpay_order_id,
                razorpay_payment_id,
                booking_id,
                payment_method
            } = paymentData;

            let transaction = null;

            if (razorpay_order_id) {

                transaction =
                    await paymentRepository
                        .getTransactionByOrderId(
                            razorpay_order_id
                        );
            }

            let bookingId =
                transaction?.booking_id ||
                booking_id;

            if (!bookingId) {

                throw new Error(
                    "Booking payment reference is required"
                );
            }

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
                transaction &&
                transaction.payment_status === "SUCCESS"
            ) {

                return {
                    message:
                        "Payment was already successful",
                    booking_id:
                        booking.id,
                    payment_status:
                        "SUCCESS"
                };
            }

            if (
                transaction
            ) {

                await paymentRepository
                    .updateTransaction(

                        transaction.razorpay_order_id,

                        razorpay_payment_id || null,

                        "FAILED",

                        payment_method || null
                    );
            }

            const result =
                await bookingService
                    .cancelFailedOnlinePayment(
                        userId,
                        booking.id,
                        getPaymentFailureMessage(paymentData)
                    );

            return {
                ...result,
                booking_id:
                    booking.id,
                booking_code:
                    booking.booking_code
            };

        } catch (error) {

            logger.error(
                `Payment failure handling failed: ${error.message}`
            );

            throw error;
        }
};

const createCommissionPaymentOrder =
    async (
        ownerId,
        commissionId
    ) => {

        try {

            ensureRazorpayConfigured();

            const commission =
                await checkinRepository
                    .getCommissionForOwnerById(
                        commissionId,
                        ownerId
                    );

            if (!commission) {
                const err = new Error("Commission not found");
                err.statusCode = 404;
                throw err;
            }

            if (commission.payment_status === "PAID") {
                const err = new Error("Commission is already paid");
                err.statusCode = 400;
                throw err;
            }

            if (commission.payment_status !== "PENDING") {
                const err = new Error("Commission is not payable");
                err.statusCode = 400;
                throw err;
            }

            const amount =
                toMoney(
                    commission.commission_amount
                );

            if (amount <= 0) {
                const err = new Error("Commission amount must be greater than zero");
                err.statusCode = 400;
                throw err;
            }

            if (amount < 1.0) {
                const err = new Error("Online payment via Razorpay requires a minimum amount of ₹1.00. Please record this payment offline instead.");
                err.statusCode = 400;
                throw err;
            }

            const razorpayOrder =
                await razorpay.orders.create({

                    amount:
                        Math.round(amount * 100),

                    currency:
                        "INR",

                    receipt:
                        `COMM-${commission.id}-${Date.now()}`,

                    notes: {
                        commission_id:
                            String(commission.id),
                        booking_code:
                            commission.booking_code || ""
                    }
                });

            await checkinRepository
                .attachCommissionRazorpayOrder(
                    commission.id,
                    ownerId,
                    razorpayOrder.id
                );

            return {
                commission_id:
                    commission.id,
                booking_code:
                    commission.booking_code,
                property_name:
                    commission.property_name,
                razorpay_order_id:
                    razorpayOrder.id,
                amount,
                currency:
                    "INR",
                payment_required:
                    true,
                razorpay_key:
                    process.env.RAZORPAY_KEY_ID
            };

        } catch (error) {

            logger.error(
                `Commission payment order failed: ${error.message}`
            );

            throw error;
        }
};

const verifyCommissionPayment =
    async (
        ownerId,
        paymentData
    ) => {

        try {

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                payment_method
            } = paymentData;

            const commission =
                await checkinRepository
                    .getCommissionByRazorpayOrderId(
                        razorpay_order_id,
                        ownerId
                    );

            if (!commission) {

                throw new Error(
                    "Commission payment order not found"
                );
            }

            if (commission.payment_status === "PAID") {

                return {
                    message:
                        "Commission payment already verified",
                    commission_id:
                        commission.id,
                    payment_status:
                        "PAID"
                };
            }

            if (
                !isValidRazorpaySignature(
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature
                )
            ) {

                await checkinRepository
                    .markCommissionRazorpayFailed(
                        commission.id,
                        ownerId,
                        "Invalid payment signature"
                    );

                throw new Error(
                    "Invalid payment signature"
                );
            }

            const result =
                await checkinRepository
                    .markCommissionRazorpayPaid(
                        commission.id,
                        ownerId,
                        {
                            razorpay_order_id,
                            razorpay_payment_id,
                            razorpay_signature,
                            payment_method:
                                payment_method || "RAZORPAY"
                        }
                    );

            if (result.affectedRows === 0) {

                throw new Error(
                    "Commission could not be marked paid"
                );
            }

            return {
                message:
                    "Commission payment verified successfully",
                commission_id:
                    commission.id,
                payment_status:
                    "PAID"
            };

        } catch (error) {

            logger.error(
                `Commission payment verification failed: ${error.message}`
            );

            throw error;
        }
};

const markCommissionPaymentFailed =
    async (
        ownerId,
        paymentData
    ) => {

        try {

            const {
                razorpay_order_id
            } = paymentData;

            const commission =
                await checkinRepository
                    .getCommissionByRazorpayOrderId(
                        razorpay_order_id,
                        ownerId
                    );

            if (!commission) {

                throw new Error(
                    "Commission payment order not found"
                );
            }

            if (commission.payment_status === "PAID") {

                return {
                    message:
                        "Commission payment was already successful",
                    commission_id:
                        commission.id,
                    payment_status:
                        "PAID"
                };
            }

            await checkinRepository
                .markCommissionRazorpayFailed(
                    commission.id,
                    ownerId,
                    getPaymentFailureMessage(paymentData)
                );

            return {
                message:
                    "Commission payment was not completed",
                commission_id:
                    commission.id,
                payment_status:
                    "PENDING"
            };

        } catch (error) {

            logger.error(
                `Commission payment failure handling failed: ${error.message}`
            );

            throw error;
        }
};

const refundPayment =
    async (
        userId,
        bookingId
    ) => {

        try {

        // GET BOOKING
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
                "Unauthorized refund request"
            );
        }

        // CHECK STATUS
        if (
            booking.payment_status !==
            "PAID"
        ) {

            throw new Error(
                "Refund only allowed for paid bookings"
            );
        }

        // GET TRANSACTION
        const transaction =
            await paymentRepository
                .getTransactionByBookingId(
                    bookingId
                );

        if (!transaction) {

            throw new Error(
                "Transaction not found"
            );
        }

        // RAZORPAY REFUND
        // NOTE:
        // In production:
        // await razorpay.payments.refund()

        // UPDATE TRANSACTION
        await paymentRepository
            .updatePaymentStatus(

                transaction.id,

                "REFUNDED"
            );

        // CANCEL BOOKING
        await bookingService
            .cancelBooking(

                userId,

                bookingId
            );

        return {

            message:
                "Refund processed successfully"
        };

    } catch (error) {

        logger.error(
            `Refund failed: ${error.message}`
        );
        throw error;
    }
};

const getMyTransactions =
    async (userId) => {

        const bookings =
            await bookingRepository
                .getUserBookings(
                    userId
                );

        return bookings;
};



module.exports = {

    createPaymentOrder,
    verifyPayment,
    markPaymentFailed,
    createCommissionPaymentOrder,
    verifyCommissionPayment,
    markCommissionPaymentFailed,
    refundPayment,
    getMyTransactions
};

