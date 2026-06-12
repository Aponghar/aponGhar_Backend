const financeService =
    require("./financeService");

const myWallet =
    async (req, res, next) => {

        try {

            const wallet =
                await financeService
                    .getMyWallet(
                        req.user.id,

                        req.user.role
                    );

            res.status(200).json({

                success: true,

                data: wallet
            });

        } catch (error) {

            next(error);
        }
};

const myTransactions =
    async (req, res, next) => {

        try {

            const transactions =
                await financeService
                    .getTransactions(
                        req.user.id,

                        req.user.role
                    );

            res.status(200).json({

                success: true,

                data: transactions
            });

        } catch (error) {

            next(error);
        }
};

const requestWithdrawal =
    async (req, res, next) => {

        try {

            const result =
                await financeService
                    .requestWithdrawal(

                        req.user.id,

                        req.body
                    );

            res.status(201).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const myWithdrawals =
    async (req, res, next) => {

        try {

            const withdrawals =
                await financeService
                    .myWithdrawals(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: withdrawals
            });

        } catch (error) {

            next(error);
        }
};

const allWithdrawals =
    async (req, res, next) => {

        try {

            const withdrawals =
                await financeService
                    .allWithdrawals();

            res.status(200).json({

                success: true,

                data: withdrawals
            });

        } catch (error) {

            next(error);
        }
};


const pendingWithdrawals =
    async (req, res, next) => {

        try {

            const withdrawals =
                await financeService
                    .pendingWithdrawals();

            res.status(200).json({

                success: true,

                data: withdrawals
            });

        } catch (error) {

            next(error);
        }
};

const approveWithdrawal =
    async (req, res, next) => {

        try {

            const result =
                await financeService
                    .approveWithdrawal(

                        req.params.withdrawalId,

                        req.body.admin_notes
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};
const rejectWithdrawal =
    async (req, res, next) => {

        try {

            const result =
                await financeService
                    .rejectWithdrawal(

                        req.params.withdrawalId,

                        req.body.admin_notes
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const markWithdrawalPaid =
    async (req, res, next) => {

        try {

            const result =
                await financeService
                    .markWithdrawalPaid(

                        req.params.withdrawalId,

                        req.body.admin_notes
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};



module.exports = {

    myWallet,

    myTransactions,

    requestWithdrawal,

    myWithdrawals,

    allWithdrawals,

    pendingWithdrawals,

    approveWithdrawal,

    rejectWithdrawal,

    markWithdrawalPaid
};
