const reviewService =
    require("./reviewService");

const {
    reviewSchema,
    reportSchema,
    moderationSchema,
    responseSchema
} = require("./reviewValidation");


const validateBody =
    (schema, body) => {

        const { error, value } =
            schema.validate(body);

        if (error) {

            return {
                error:
                    error.details[0].message
            };
        }

        return {
            value
        };
};


const createReview =
    async (req, res, next) => {

        try {

            const {
                error,
                value
            } = validateBody(
                reviewSchema,
                req.body
            );

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error
                });
            }

            const result =
                await reviewService
                    .createReview(

                        req.user.id,

                        value,

                        req.files || []
                    );

            res.status(201).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getPropertyReviews =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const reviews =
                await reviewService
                    .getReviews(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                results:
                    reviews.length,

                data: reviews
            });

        } catch (error) {

            next(error);
        }
};

const getReviewAnalytics =
    async (req, res, next) => {

        try {

            const { propertyId } =
                req.params;

            const result =
                await reviewService
                    .getPropertyAnalytics(
                        propertyId
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const reportReview =
    async (req, res, next) => {

        try {

            const {
                error,
                value
            } = validateBody(
                reportSchema,
                req.body
            );

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error
                });
            }

            const result =
                await reviewService
                    .reportReview(

                        req.user.id,

                        value
                    );

            res.status(201).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const moderateReview =
    async (req, res, next) => {

        try {

            const { reviewId } =
                req.params;

            const {
                error,
                value
            } = validateBody(
                moderationSchema,
                req.body
            );

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error
                });
            }

            const result =
                await reviewService
                    .moderateReview(

                        reviewId,

                        value.review_status,

                        value.moderation_notes
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const respondToReview =
    async (req, res, next) => {

        try {

            const { reviewId } =
                req.params;

            const {
                error,
                value
            } = validateBody(
                responseSchema,
                req.body
            );

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error
                });
            }

            const result =
                await reviewService
                    .respondToReview(

                        req.user.id,

                        reviewId,

                        value.response_text
                    );

            res.status(201).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getReviewResponses =
    async (req, res, next) => {

        try {

            const { reviewId } =
                req.params;

            const responses =
                await reviewService
                    .getResponses(
                        reviewId
                    );

            res.status(200).json({

                success: true,

                data: responses
            });

        } catch (error) {

            next(error);
        }
};

const getOwnerReviews =
    async (req, res, next) => {

        try {

            const reviews =
                await reviewService
                    .getOwnerReviews(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: reviews
            });

        } catch (error) {

            next(error);
        }
};

module.exports = {

    createReview,
    getPropertyReviews,
    getReviewAnalytics,
    reportReview,
    moderateReview,
    respondToReview,
    getReviewResponses,
    getOwnerReviews
};
