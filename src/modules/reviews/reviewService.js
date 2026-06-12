const reviewRepository =
    require("./reviewRepository");

const bookingRepository =
    require("../bookings/bookingRepository");

const propertyRepository =
    require("../properties/propertyRepository");

const makeError =
    (message, statusCode) => {

        const error =
            new Error(message);

        error.statusCode =
            statusCode;

        return error;
};

const normalizeUploadPath =
    (file) => {

        if (!file || !file.path) {

            return "";
        }

        return file.path
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");
};

const createReview =
    async (
        userId,
        reviewData,
        files = []
    ) => {

        const {

            booking_id,

            rating,

            review_text

        } = reviewData;

        const photoUrls =
            files
                .map(normalizeUploadPath)
                .filter(Boolean);

        // GET BOOKING
        const booking =
            await bookingRepository
                .getBookingById(
                    booking_id
                );

        if (!booking) {

            throw makeError(
                "Booking not found",
                404
            );
        }

        // VERIFY USER
        if (
            Number(booking.user_id) !== Number(userId)
        ) {

            throw makeError(
                "Unauthorized review",
                403
            );
        }

        // ONLY COMPLETED BOOKINGS
        if (
            booking.booking_status !==
            "COMPLETED"
        ) {

            throw makeError(
                "Only completed bookings can be reviewed",
                400
            );
        }

        // PREVENT DUPLICATES
        const exists =
            await reviewRepository
                .existingReview(

                    booking_id,

                    userId
                );

        if (exists) {

            throw makeError(
                "Review already submitted",
                409
            );
        }

        // CREATE REVIEW
        const reviewResult =
            await reviewRepository
            .createReview({

                booking_id,

                property_id:
                    booking.property_id,

                room_id:
                    booking.room_id,

                user_id:
                    userId,

                rating,

                review_text
            });

        if (photoUrls.length > 0) {

            await reviewRepository
                .createReviewPhotos(
                    reviewResult.insertId,
                    photoUrls
                );
        }

        // UPDATE PROPERTY RATINGS
        await reviewRepository
            .updatePropertyRatings(
                booking.property_id
            );
        // UPDATE TRUST SCORE
        await reviewRepository
            .updateTrustScore(
                booking.property_id
            );    

        return {

            message:
                "Review submitted successfully",

            review_id:
                reviewResult.insertId
        };
};

const getReviews =
    async (propertyId) => {

        return reviewRepository
            .getPropertyReviews(
                propertyId
            );
};

const getPropertyAnalytics =
    async (propertyId) => {

        const analytics =
            await reviewRepository
                .getReviewAnalytics(
                    propertyId
                );

        const breakdown =
            await reviewRepository
                .getRatingBreakdown(
                    propertyId
                );

        return {

            analytics,

            breakdown
        };
};

const reportReview =
    async (
        userId,
        reportData
    ) => {

        const {

            review_id,

            reason,

            additional_notes

        } = reportData;

        // CHECK REVIEW
        const review =
            await reviewRepository
                .getReviewById(
                    review_id
                );

        if (!review) {

            throw makeError(
                "Review not found",
                404
            );
        }

        await reviewRepository
            .createReviewReport({

                review_id,

                reported_by:
                    userId,

                reason,

                additional_notes
            });

        return {

            message:
                "Review reported successfully"
        };
};

const moderateReview =
    async (
        reviewId,
        reviewStatus,
        moderationNotes
    ) => {

        const review =
            await reviewRepository
                .getReviewById(
                    reviewId
                );

        if (!review) {

            throw makeError(
                "Review not found",
                404
            );
        }

        // UPDATE REVIEW STATUS
        await reviewRepository
            .updateReviewStatus(

                reviewId,

                reviewStatus,

                moderationNotes
            );

        // RECALCULATE RATINGS
        await reviewRepository
            .updatePropertyRatings(
                review.property_id
            );

        // UPDATE TRUST SCORE
        await reviewRepository
            .updateTrustScore(
                review.property_id
            );

        return {

            message:
                "Review moderated successfully"
        };
};

const respondToReview =
    async (
        ownerId,
        reviewId,
        responseText
    ) => {

        const review =
            await reviewRepository
                .getReviewById(
                    reviewId
                );

        if (!review) {

            throw makeError(
                "Review not found",
                404
            );
        }

        // VERIFY PROPERTY OWNERSHIP
        const property =
            await propertyRepository
                .getPropertyById(
                    review.property_id
                );

        if (
            !property ||
            Number(property.owner_id) !== Number(ownerId)
        ) {

            throw makeError(
                "Unauthorized response",
                403
            );
        }

        await reviewRepository
            .createOwnerResponse({

                review_id:
                    reviewId,

                owner_id:
                    ownerId,

                response_text:
                    responseText
            });

        return {

            message:
                "Response added successfully"
        };
};

const getResponses =
    async (reviewId) => {

        return reviewRepository
            .getReviewResponses(
                reviewId
            );
};

const getOwnerReviews =
    async (ownerId) => {

        return reviewRepository
            .getOwnerReviews(
                ownerId
            );
};


module.exports = {

    createReview,

    getReviews,

    getPropertyAnalytics,

    reportReview,

    moderateReview,

    respondToReview,

    getResponses,

    getOwnerReviews
};
