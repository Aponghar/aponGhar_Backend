const pool =
    require("../../config/db");

const createWallet =
    async (
        userId,
        walletType
    ) => {

        const [result] =
            await pool.query(

                `INSERT INTO wallets (

                    user_id,

                    wallet_type

                )

                VALUES (?, ?)`,

                [
                    userId,
                    walletType
                ]
            );

        return result;
};

const getWalletByUserId =
    async (userId) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM wallets

                WHERE user_id = ?`,

                [userId]
            );

        return rows[0];
};

const updateWalletBalance =
    async (
        walletId,
        newBalance
    ) => {

        await pool.query(

            `UPDATE wallets

            SET balance = ?

            WHERE id = ?`,

            [
                newBalance,
                walletId
            ]
        );
};


const createTransaction =
    async (transactionData) => {

        const {

            wallet_id,

            transaction_type,

            amount,

            balance_before,

            balance_after,

            reference_id,

            description

        } = transactionData;

        const [result] =
            await pool.query(

                `INSERT INTO wallet_transactions (

                    wallet_id,

                    transaction_type,

                    amount,

                    balance_before,

                    balance_after,

                    reference_id,

                    description

                )

                VALUES (?, ?, ?, ?, ?, ?, ?)`,

                [

                    wallet_id,

                    transaction_type,

                    amount,

                    balance_before,

                    balance_after,

                    reference_id,

                    description
                ]
            );

        return result;
};

const getWalletTransactions =
    async (walletId) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM wallet_transactions

                WHERE wallet_id = ?

                ORDER BY created_at DESC`,

                [walletId]
            );

        return rows;
};

const createOwnerEarning =
    async (earningData) => {

        const {

            owner_id,

            booking_id,

            property_id,

            gross_amount,

            commission_percentage,

            commission_amount,

            net_earning

        } = earningData;

        const [result] =
            await pool.query(

                `INSERT INTO owner_earnings (

                    owner_id,

                    booking_id,

                    property_id,

                    gross_amount,

                    commission_percentage,

                    commission_amount,

                    net_earning

                )

                VALUES (?, ?, ?, ?, ?, ?, ?)`,

                [

                    owner_id,

                    booking_id,

                    property_id,

                    gross_amount,

                    commission_percentage,

                    commission_amount,

                    net_earning
                ]
            );

        return result;
};

const createWithdrawalRequest =
    async (withdrawalData) => {

        const {

            owner_id,

            wallet_id,

            amount,

            bank_name,

            account_holder_name,

            account_number,

            ifsc_code,

            upi_id

        } = withdrawalData;

        const [result] =
            await pool.query(

                `INSERT INTO withdrawal_requests (

                    owner_id,

                    wallet_id,

                    amount,

                    bank_name,

                    account_holder_name,

                    account_number,

                    ifsc_code,

                    upi_id

                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

                [

                    owner_id,

                    wallet_id,

                    amount,

                    bank_name,

                    account_holder_name,

                    account_number,

                    ifsc_code,

                    upi_id
                ]
            );

        return result;
};

const getWithdrawalRequestById =
    async (withdrawalId) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM withdrawal_requests

                WHERE id = ?`,

                [withdrawalId]
            );

        return rows[0];
};

const getOwnerWithdrawals =
    async (ownerId) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM withdrawal_requests

                WHERE owner_id = ?

                ORDER BY created_at DESC`,

                [ownerId]
            );

        return rows;
};

const updateWithdrawalStatus =
    async (
        withdrawalId,
        status,
        adminNotes = null
    ) => {

        await pool.query(

            `UPDATE withdrawal_requests

            SET

                withdrawal_status = ?,

                admin_notes = ?

            WHERE id = ?`,

            [

                status,

                adminNotes,

                withdrawalId
            ]
        );
};


const updatePendingBalance =
    async (
        walletId,
        pendingBalance
    ) => {

        await pool.query(

            `UPDATE wallets

            SET pending_balance = ?

            WHERE id = ?`,

            [

                pendingBalance,

                walletId
            ]
        );
};

const getAllWithdrawals =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    wr.*,

                    u.full_name AS name,

                    u.email

                FROM withdrawal_requests wr

                JOIN users u
                ON wr.owner_id = u.id

                ORDER BY wr.created_at DESC`
            );

        return rows;
};

const getPendingWithdrawals =
    async () => {

        const [rows] =
            await pool.query(

                `SELECT

                    wr.*,

                    u.full_name AS name,

                    u.email

                FROM withdrawal_requests wr

                JOIN users u
                ON wr.owner_id = u.id

                WHERE wr.withdrawal_status =
                'PENDING'

                ORDER BY wr.created_at DESC`
            );

        return rows;
};

const getWalletById =
    async (walletId) => {

        const [rows] =
            await pool.query(

                `SELECT *

                FROM wallets

                WHERE id = ?`,

                [walletId]
            );

        return rows[0];
};

const getOwnerEarningByBookingId =
    async (bookingId) => {

        const [rows] =
            await pool.query(

                `SELECT *
                FROM owner_earnings
                WHERE booking_id = ?`,

                [bookingId]
            );

        return rows[0];
};

const updateOwnerEarningStatus =
    async (
        earningId,
        status
    ) => {

        await pool.query(

            `UPDATE owner_earnings
            SET earning_status = ?
            WHERE id = ?`,

            [
                status,
                earningId
            ]
        );
};

const deleteOwnerEarning =
    async (earningId) => {

        await pool.query(

            `DELETE FROM owner_earnings
            WHERE id = ?`,

            [earningId]
        );
};

const getBookingCodeById =
    async (bookingId) => {

        const [rows] =
            await pool.query(

                `SELECT booking_code
                FROM bookings
                WHERE id = ?`,

                [bookingId]
            );

        return rows[0]?.booking_code;
};

module.exports = {

    createWallet,

    getWalletByUserId,

    updateWalletBalance,

    createTransaction,

    getWalletTransactions,

    createOwnerEarning,

    createWithdrawalRequest,

    getWithdrawalRequestById,

    getOwnerWithdrawals,

    updateWithdrawalStatus,

    updatePendingBalance,

    getAllWithdrawals,

    getPendingWithdrawals,

    getWalletById,

    getOwnerEarningByBookingId,

    updateOwnerEarningStatus,

    deleteOwnerEarning,

    getBookingCodeById
};
