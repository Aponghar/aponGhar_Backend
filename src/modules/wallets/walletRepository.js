const pool = require("../../config/db");

const getWalletByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM wallets WHERE user_id = ?`,
        [userId]
    );
    return rows[0];
};

const createWallet = async (userId, walletType = 'USER') => {
    const [result] = await pool.query(
        `INSERT INTO wallets (user_id, wallet_type, balance, pending_balance)
         VALUES (?, ?, 0.00, 0.00)`,
        [userId, walletType]
    );
    return result;
};

const getOrCreateWallet = async (userId, walletType = 'USER') => {
    let wallet = await getWalletByUserId(userId);
    
    if (!wallet) {
        await createWallet(userId, walletType);
        wallet = await getWalletByUserId(userId);
    }
    
    return wallet;
};

const creditWallet = async (walletId, amount, description) => {
    const wallet = await pool.query(
        `SELECT * FROM wallets WHERE id = ?`,
        [walletId]
    );

    if (!wallet[0] || wallet[0].length === 0) {
        throw new Error("Wallet not found");
    }

    const currentWallet = wallet[0][0];
    const newBalance = parseFloat(currentWallet.balance) + parseFloat(amount);

    // Update wallet balance
    await pool.query(
        `UPDATE wallets SET balance = ? WHERE id = ?`,
        [newBalance, walletId]
    );

    // Create transaction record
    const [transaction] = await pool.query(
        `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_before, balance_after, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            walletId,
            'CREDIT',
            amount,
            currentWallet.balance,
            newBalance,
            description
        ]
    );

    return {
        walletId,
        amount,
        newBalance,
        transactionId: transaction.insertId
    };
};

const debitWallet = async (walletId, amount, description) => {
    const wallet = await pool.query(
        `SELECT * FROM wallets WHERE id = ?`,
        [walletId]
    );

    if (!wallet[0] || wallet[0].length === 0) {
        throw new Error("Wallet not found");
    }

    const currentWallet = wallet[0][0];

    if (parseFloat(currentWallet.balance) < parseFloat(amount)) {
        throw new Error("Insufficient wallet balance");
    }

    const newBalance = parseFloat(currentWallet.balance) - parseFloat(amount);

    // Update wallet balance
    await pool.query(
        `UPDATE wallets SET balance = ? WHERE id = ?`,
        [newBalance, walletId]
    );

    // Create transaction record
    const [transaction] = await pool.query(
        `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount, balance_before, balance_after, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            walletId,
            'DEBIT',
            amount,
            currentWallet.balance,
            newBalance,
            description
        ]
    );

    return {
        walletId,
        amount,
        newBalance,
        transactionId: transaction.insertId
    };
};

const getWalletTransactions = async (walletId) => {
    const [rows] = await pool.query(
        `SELECT * FROM wallet_transactions 
         WHERE wallet_id = ? 
         ORDER BY created_at DESC`,
        [walletId]
    );
    return rows;
};

module.exports = {
    getWalletByUserId,
    createWallet,
    getOrCreateWallet,
    creditWallet,
    debitWallet,
    getWalletTransactions
};
