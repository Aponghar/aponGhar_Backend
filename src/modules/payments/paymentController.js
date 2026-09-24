const paymentService =
    require("./paymentService");



const createOrder =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const result =
                await paymentService
                    .createPaymentOrder(

                        req.user.id,

                        bookingId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const verifyPayment =
    async (req, res, next) => {

        try {

            const result =
                await paymentService
                    .verifyPayment(
                        req.user.id,
                        req.body
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const markPaymentFailed =
    async (req, res, next) => {

        try {

            const result =
                await paymentService
                    .markPaymentFailed(
                        req.user.id,
                        req.body
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const createCommissionOrder =
    async (req, res, next) => {

        try {

            const result =
                await paymentService
                    .createCommissionPaymentOrder(
                        req.user.id,
                        req.params.commissionId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const verifyCommissionPayment =
    async (req, res, next) => {

        try {

            const result =
                await paymentService
                    .verifyCommissionPayment(
                        req.user.id,
                        req.body
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const markCommissionPaymentFailed =
    async (req, res, next) => {

        try {

            const result =
                await paymentService
                    .markCommissionPaymentFailed(
                        req.user.id,
                        req.body
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const refundPayment =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const result =
                await paymentService
                    .refundPayment(

                        req.user.id,

                        bookingId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getTransactions =
    async (req, res, next) => {

        try {

            const transactions =
                await paymentService
                    .getMyTransactions(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: transactions
            });

        } catch (error) {

            next(error);
        }
};


const handleWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

        const result = await paymentService.handleRazorpayWebhook(
            rawBody,
            signature,
            req.body
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Razorpay Webhook Error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    markPaymentFailed,
    createCommissionOrder,
    verifyCommissionPayment,
    markCommissionPaymentFailed,
    refundPayment,
    getTransactions,
    handleWebhook
};
