const pool =
    require("../../config/db");


const createTransaction =
    async (transactionData) => {

        const {

            booking_id,

            razorpay_order_id,

            amount

        } = transactionData;

        const [result] = await pool.query(

            `INSERT INTO transactions (

                booking_id,

                razorpay_order_id,

                amount

            )

            VALUES (?, ?, ?)`,

            [

                booking_id,

                razorpay_order_id,

                amount
            ]
        );

        return result;
};


const getTransactionByOrderId =
    async (orderId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM transactions

            WHERE razorpay_order_id = ?`,

            [orderId]
        );

        return rows[0];
};

const updateTransaction =
    async (
        orderId,
        paymentId,
        paymentStatus,
        paymentMethod = null
    ) => {

        await pool.query(

            `UPDATE transactions

            SET

                razorpay_payment_id = ?,

                payment_status = ?,

                payment_method = ?

            WHERE razorpay_order_id = ?`,

            [

                paymentId,

                paymentStatus,

                paymentMethod,

                orderId
            ]
        );
};

const getTransactionByBookingId =
    async (bookingId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM transactions

            WHERE booking_id = ?`,

            [bookingId]
        );

        return rows[0];
};

const updatePaymentStatus =
    async (
        transactionId,
        paymentStatus
    ) => {

        await pool.query(

            `UPDATE transactions

            SET payment_status = ?

            WHERE id = ?`,

            [
                paymentStatus,
                transactionId
            ]
        );
};


module.exports = {

    createTransaction,

    getTransactionByOrderId,

    updateTransaction,

    getTransactionByBookingId,

    updatePaymentStatus
};

