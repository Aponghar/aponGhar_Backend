const express =
    require("express");

const router =
    express.Router();

const authMiddleware =
    require("../../middleware/authMiddleware");

const roleMiddleware =
    require("../../middleware/roleMiddleware");

const {

    myWallet,

    myTransactions,

    requestWithdrawal,

    myWithdrawals,

    allWithdrawals,

    pendingWithdrawals,

    approveWithdrawal,

    rejectWithdrawal,

    markWithdrawalPaid

} = require("./financeController");



// MY WALLET
router.get(

    "/wallet",

    authMiddleware,

    myWallet
);



// TRANSACTION HISTORY
router.get(

    "/transactions",

    authMiddleware,

    myTransactions
);

// REQUEST WITHDRAWAL
router.post(

    "/withdrawals",

    authMiddleware,

    roleMiddleware("OWNER"),

    requestWithdrawal
);



// MY WITHDRAWALS
router.get(

    "/withdrawals",

    authMiddleware,

    roleMiddleware("OWNER"),

    myWithdrawals
);


// ALL WITHDRAWALS
router.get(

    "/admin/withdrawals",

    authMiddleware,

    roleMiddleware("ADMIN"),

    allWithdrawals
);



// PENDING WITHDRAWALS
router.get(

    "/admin/withdrawals/pending",

    authMiddleware,

    roleMiddleware("ADMIN"),

    pendingWithdrawals
);



// APPROVE
router.patch(

    "/admin/withdrawals/approve/:withdrawalId",

    authMiddleware,

    roleMiddleware("ADMIN"),

    approveWithdrawal
);



// REJECT
router.patch(

    "/admin/withdrawals/reject/:withdrawalId",

    authMiddleware,

    roleMiddleware("ADMIN"),

    rejectWithdrawal
);



// MARK PAID
router.patch(

    "/admin/withdrawals/paid/:withdrawalId",

    authMiddleware,

    roleMiddleware("ADMIN"),

    markWithdrawalPaid
);


module.exports = router;