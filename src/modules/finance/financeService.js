const financeRepository =
    require("./financeRepository");

const authRepository =
    require("../auth/authRepository");

const notificationService =
    require("../notifications/notificationService");

const safeSendOwnerEarningUnlocked = async (emailData) => {
    try {
        await notificationService.sendOwnerEarningUnlocked(emailData);
    } catch (error) {
        console.error("Owner earning unlocked email failed:", error.message);
    }
};

const safeSendWithdrawalRequested = async (emailData) => {
    try {
        await notificationService.sendWithdrawalRequested(emailData);
    } catch (error) {
        console.error("Withdrawal requested email failed:", error.message);
    }
};

const safeSendWithdrawalApproved = async (emailData) => {
    try {
        await notificationService.sendWithdrawalApproved(emailData);
    } catch (error) {
        console.error("Withdrawal approved email failed:", error.message);
    }
};

const safeSendWithdrawalPaid = async (emailData) => {
    try {
        await notificationService.sendWithdrawalPaid(emailData);
    } catch (error) {
        console.error("Withdrawal paid email failed:", error.message);
    }
};

const safeSendWithdrawalRejected = async (emailData) => {
    try {
        await notificationService.sendWithdrawalRejected(emailData);
    } catch (error) {
        console.error("Withdrawal rejected email failed:", error.message);
    }
};

const ensureWallet =
    async (
        userId,
        role = "USER"
    ) => {

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

                role === "OWNER"
                    ? "OWNER"
                    : "USER"
            );

        wallet =
            await financeRepository
                .getWalletByUserId(
                    userId
                );

        return wallet;
};

const getMyWallet =
    async (
        userId,
        role = "USER"
    ) => {

        return ensureWallet(
            userId,
            role
        );
};

const getTransactions =
    async (
        userId,
        role = "USER"
    ) => {

        const wallet =
            await ensureWallet(

                userId,

                role
            );

        return financeRepository
            .getWalletTransactions(
                wallet.id
            );
};

const calculateSellingPrice =
    (
        basePrice,
        commissionPercentage
    ) => {

        const commissionAmount =

            (
                basePrice *
                commissionPercentage
            ) / 100;

        return Number(

            (
                Number(basePrice) +
                commissionAmount
            ).toFixed(2)
        );
};

const calculateOwnerEarning =
    (
        grossAmount,
        commissionPercentage
    ) => {

        const commissionAmount =

            (
                grossAmount *
                commissionPercentage
            ) / 100;

        const netEarning =

            grossAmount -
            commissionAmount;

        return {

            grossAmount,

            commissionAmount,

            netEarning
        };
};

const requestWithdrawal =
    async (
        ownerId,
        withdrawalData
    ) => {

        const wallet =
            await financeRepository
                .getWalletByUserId(
                    ownerId
                );

        if (!wallet) {

            throw new Error(
                "Wallet not found"
            );
        }

        const amount =
            Number(
                withdrawalData.amount
            );

        // VALIDATE BALANCE
        if (
            amount > wallet.balance
        ) {

            throw new Error(
                "Insufficient wallet balance"
            );
        }

        // AVAILABLE BALANCE
        const availableBalance =

            Number(wallet.balance) -
            amount;

        // PENDING BALANCE
        const pendingBalance =

            Number(
                wallet.pending_balance || 0
            ) + amount;



        // UPDATE WALLET
        await financeRepository
            .updateWalletBalance(

                wallet.id,

                availableBalance
            );



        // UPDATE PENDING
        await financeRepository
            .updatePendingBalance(

                wallet.id,

                pendingBalance
            );



        // CREATE REQUEST
        const withdrawal =
            await financeRepository
                .createWithdrawalRequest({

                    owner_id:
                        ownerId,

                    wallet_id:
                        wallet.id,

                    amount,

                    bank_name:
                        withdrawalData.bank_name,

                    account_holder_name:
                        withdrawalData.account_holder_name,

                    account_number:
                        withdrawalData.account_number,

                    ifsc_code:
                        withdrawalData.ifsc_code,

                    upi_id:
                        withdrawalData.upi_id
                });



        // LEDGER ENTRY
        await financeRepository
            .createTransaction({

                wallet_id:
                    wallet.id,

                transaction_type:
                    "WITHDRAWAL",

                amount,

                balance_before:
                    wallet.balance,

                balance_after:
                    availableBalance,

                reference_id:
                    withdrawal.insertId,

                description:
                    "Withdrawal request created"
            });

        // Send email to owner
        try {
            const owner = await authRepository.findUserById(ownerId);
            if (owner?.email) {
                safeSendWithdrawalRequested({
                    email: owner.email,
                    name: owner.full_name || "Host",
                    amount: amount,
                    upi_id: withdrawalData.upi_id,
                    bank_name: withdrawalData.bank_name,
                    account_holder_name: withdrawalData.account_holder_name,
                    account_number: withdrawalData.account_number,
                    ifsc_code: withdrawalData.ifsc_code
                });
            }
        } catch (err) {
            console.error("Failed to send withdrawal request email:", err.message);
        }

        return {

            message:
                "Withdrawal request submitted"
        };
};

const myWithdrawals =
    async (ownerId) => {

        return financeRepository
            .getOwnerWithdrawals(
                ownerId
            );
};

const allWithdrawals =
    async () => {

        return financeRepository
            .getAllWithdrawals();
};

const pendingWithdrawals =
    async () => {

        return financeRepository
            .getPendingWithdrawals();
};

const approveWithdrawal =
    async (
        withdrawalId,
        adminNotes = null
    ) => {

        const withdrawal =
            await financeRepository
                .getWithdrawalRequestById(
                    withdrawalId
                );

        if (!withdrawal) {

            throw new Error(
                "Withdrawal request not found"
            );
        }

        if (
            withdrawal.withdrawal_status !==
            "PENDING"
        ) {

            throw new Error(
                "Withdrawal already processed"
            );
        }

        await financeRepository
            .updateWithdrawalStatus(

                withdrawalId,

                "APPROVED",

                adminNotes
            );

        // Send email to owner
        try {
            const owner = await authRepository.findUserById(withdrawal.owner_id);
            if (owner?.email) {
                safeSendWithdrawalApproved({
                    email: owner.email,
                    name: owner.full_name || "Host",
                    amount: withdrawal.amount,
                    admin_notes: adminNotes
                });
            }
        } catch (err) {
            console.error("Failed to send withdrawal approval email:", err.message);
        }

        return {

            message:
                "Withdrawal approved successfully"
        };
};

const rejectWithdrawal =
    async (
        withdrawalId,
        adminNotes = null
    ) => {

        const withdrawal =
            await financeRepository
                .getWithdrawalRequestById(
                    withdrawalId
                );

        if (!withdrawal) {

            throw new Error(
                "Withdrawal request not found"
            );
        }

        if (
            withdrawal.withdrawal_status !== "PENDING" &&
            withdrawal.withdrawal_status !== "APPROVED"
        ) {

            throw new Error(
                "Withdrawal already processed"
            );
        }

        // WALLET
        const wallet =
            await financeRepository
                .getWalletById(
                    withdrawal.wallet_id
                );



        // RETURN BALANCE
        const newBalance =

            Number(wallet.balance) +
            Number(withdrawal.amount);



        // REMOVE PENDING
        const newPendingBalance =

            Number(wallet.pending_balance) -
            Number(withdrawal.amount);



        // UPDATE WALLET
        await financeRepository
            .updateWalletBalance(

                wallet.id,

                newBalance
            );



        await financeRepository
            .updatePendingBalance(

                wallet.id,

                newPendingBalance
            );



        // CREATE REFUND TRANSACTION
        await financeRepository
            .createTransaction({
                wallet_id:
                    wallet.id,
                transaction_type:
                    "REFUND",
                amount:
                    withdrawal.amount,
                balance_before:
                    wallet.balance,
                balance_after:
                    newBalance,
                reference_id:
                    withdrawalId,
                description:
                    `Withdrawal request rejected by admin: ${adminNotes || "No reason provided"}`
            });



        // UPDATE STATUS
        await financeRepository
            .updateWithdrawalStatus(

                withdrawalId,

                "REJECTED",

                adminNotes
            );

        // Send email to owner
        try {
            const owner = await authRepository.findUserById(withdrawal.owner_id);
            if (owner?.email) {
                safeSendWithdrawalRejected({
                    email: owner.email,
                    name: owner.full_name || "Host",
                    amount: withdrawal.amount,
                    admin_notes: adminNotes
                });
            }
        } catch (err) {
            console.error("Failed to send withdrawal rejection email:", err.message);
        }

        return {

            message:
                "Withdrawal rejected"
        };
};

const markWithdrawalPaid =
    async (
        withdrawalId,
        adminNotes = null
    ) => {

        const withdrawal =
            await financeRepository
                .getWithdrawalRequestById(
                    withdrawalId
                );

        if (!withdrawal) {

            throw new Error(
                "Withdrawal request not found"
            );
        }

        if (
            withdrawal.withdrawal_status !==
            "APPROVED"
        ) {

            throw new Error(
                "Withdrawal must be approved first"
            );
        }

        // WALLET
        const wallet =
            await financeRepository
                .getWalletById(
                    withdrawal.wallet_id
                );



        // REMOVE PENDING
        const newPendingBalance =

            Number(wallet.pending_balance) -
            Number(withdrawal.amount);



        // UPDATE PENDING
        await financeRepository
            .updatePendingBalance(

                wallet.id,

                newPendingBalance
            );



        // MARK PAID
        await financeRepository
            .updateWithdrawalStatus(

                withdrawalId,

                "PAID",

                adminNotes
            );

        // Send email to owner
        try {
            const owner = await authRepository.findUserById(withdrawal.owner_id);
            if (owner?.email) {
                safeSendWithdrawalPaid({
                    email: owner.email,
                    name: owner.full_name || "Host",
                    amount: withdrawal.amount,
                    admin_notes: adminNotes
                });
            }
        } catch (err) {
            console.error("Failed to send withdrawal paid email:", err.message);
        }

        return {

            message:
                "Withdrawal marked as paid"
        };
};

const unlockOwnerEarning =
    async (bookingId) => {

        const earning =
            await financeRepository
                .getOwnerEarningByBookingId(
                    bookingId
                );

        if (!earning) {

            return;
        }

        if (
            earning.earning_status !==
            "PENDING"
        ) {

            return;
        }

        const wallet =
            await financeRepository
                .getWalletByUserId(
                    earning.owner_id
                );

        if (!wallet) {

            throw new Error(
                "Owner wallet not found"
            );
        }

        const balanceBefore =
            Number(wallet.balance);

        const balanceAfter =
            balanceBefore +
            Number(earning.net_earning);

        const pendingBefore =
            Number(wallet.pending_balance || 0);

        const pendingAfter =
            Math.max(
                0,
                pendingBefore -
                Number(earning.net_earning)
            );

        // Update wallet balances
        await financeRepository
            .updateWalletBalance(
                wallet.id,
                balanceAfter
            );

        await financeRepository
            .updatePendingBalance(
                wallet.id,
                pendingAfter
            );

        // Update earning status to AVAILABLE
        await financeRepository
            .updateOwnerEarningStatus(
                earning.id,
                "AVAILABLE"
            );

        // Get booking code
        const bookingCode =
            await financeRepository
                .getBookingCodeById(
                    bookingId
                ) || `BK-${bookingId}`;

        // Create transaction
        await financeRepository
            .createTransaction({

                wallet_id:
                    wallet.id,

                transaction_type:
                    "OWNER_EARNING",

                amount:
                    earning.net_earning,

                balance_before:
                    balanceBefore,

                balance_after:
                    balanceAfter,

                reference_id:
                    bookingCode,

                description:
                    "Owner earning unlocked for guest check-in"
            });

        // Send email to owner
        try {
            const owner = await authRepository.findUserById(earning.owner_id);
            if (owner?.email) {
                safeSendOwnerEarningUnlocked({
                    email: owner.email,
                    name: owner.full_name || "Host",
                    amount: earning.net_earning,
                    balance: balanceAfter,
                    reference_id: bookingCode,
                    description: "Owner earning unlocked for guest check-in"
                });
            }
        } catch (err) {
            console.error("Failed to send owner earning unlocked email:", err.message);
        }
};

const reverseOwnerEarning =
    async (bookingId) => {

        const earning =
            await financeRepository
                .getOwnerEarningByBookingId(
                    bookingId
                );

        if (!earning) {

            return;
        }

        if (
            earning.earning_status !==
            "PENDING"
        ) {

            return;
        }

        const wallet =
            await financeRepository
                .getWalletByUserId(
                    earning.owner_id
                );

        if (wallet) {

            const pendingBefore =
                Number(wallet.pending_balance || 0);

            const pendingAfter =
                Math.max(
                    0,
                    pendingBefore -
                    Number(earning.net_earning)
                );

            await financeRepository
                .updatePendingBalance(
                    wallet.id,
                    pendingAfter
                );
        }

        await financeRepository
            .deleteOwnerEarning(
                earning.id
            );
};

module.exports = {

    getMyWallet,

    getTransactions,

    calculateSellingPrice,

    calculateOwnerEarning,

    requestWithdrawal,

    myWithdrawals,

    allWithdrawals,

    pendingWithdrawals,

    approveWithdrawal,

    rejectWithdrawal,

    markWithdrawalPaid,

    unlockOwnerEarning,

    reverseOwnerEarning
};
