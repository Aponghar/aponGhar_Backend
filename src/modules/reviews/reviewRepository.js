const pool =
    require("../../config/db");



const createReview =
    async (reviewData) => {

        const {

            booking_id,

            property_id,

            room_id,

            user_id,

            rating,

            review_text

        } = reviewData;

        const [result] = await pool.query(

            `INSERT INTO reviews (

                booking_id,

                property_id,

                room_id,

                user_id,

                rating,

                review_text

            )

            VALUES (?, ?, ?, ?, ?, ?)`,

            [

                booking_id,

                property_id,

                room_id,

                user_id,

                rating,

                review_text
            ]
        );

        return result;
};

const existingReview =
    async (
        bookingId,
        userId
    ) => {

        const [rows] = await pool.query(

            `SELECT id

            FROM reviews

            WHERE booking_id = ?
            AND user_id = ?`,

            [
                bookingId,
                userId
            ]
        );

        return rows[0];
};

const createReviewPhotos =
    async (
        reviewId,
        photoUrls
    ) => {

        if (!photoUrls.length) {

            return;
        }

        await pool.query(

            `INSERT INTO review_photos (

                review_id,

                image_url

            )

            VALUES ?`,

            [
                photoUrls.map((imageUrl) => [
                    reviewId,
                    imageUrl
                ])
            ]
        );
};

const attachReviewExtras =
    async (reviews) => {

        if (!reviews.length) {

            return reviews;
        }

        const reviewIds =
            reviews.map((review) => review.id);

        const [photos] = await pool.query(

            `SELECT

                id,

                review_id,

                image_url

            FROM review_photos

            WHERE review_id IN (?)`,

            [reviewIds]
        );

        const [responses] = await pool.query(

            `SELECT

                rr.id,

                rr.review_id,

                rr.response_text,

                rr.created_at,

                u.full_name AS owner_name

            FROM review_responses rr

            JOIN users u
            ON rr.owner_id = u.id

            WHERE rr.review_id IN (?)

            ORDER BY rr.created_at ASC`,

            [reviewIds]
        );

        const photosByReview = new Map();
        const responsesByReview = new Map();

        photos.forEach((photo) => {

            const list =
                photosByReview.get(photo.review_id) || [];

            list.push(photo);
            photosByReview.set(photo.review_id, list);
        });

        responses.forEach((response) => {

            const list =
                responsesByReview.get(response.review_id) || [];

            list.push(response);
            responsesByReview.set(response.review_id, list);
        });

        return reviews.map((review) => ({

            ...review,

            photos:
                photosByReview.get(review.id) || [],

            responses:
                responsesByReview.get(review.id) || []
        }));
};

const getPropertyReviews =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT

                r.id,

                r.booking_id,

                r.property_id,

                r.room_id,

                r.user_id,

                r.rating,

                r.review_text,

                r.created_at,

                u.full_name,

                b.booking_code,

                room.room_name,

                room.room_type

            FROM reviews r

            JOIN users u
            ON r.user_id = u.id

            JOIN bookings b
            ON r.booking_id = b.id

            JOIN room
            ON r.room_id = room.id

            WHERE r.property_id = ?
            AND r.review_status = 'VISIBLE'

            ORDER BY r.created_at DESC`,

            [propertyId]
        );

        return attachReviewExtras(rows);
};

const updatePropertyRatings =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT

                AVG(rating)
                AS avg_rating,

                COUNT(*) AS total

            FROM reviews

            WHERE property_id = ?
            AND review_status = 'VISIBLE'`,

            [propertyId]
        );

        const averageRating =
            rows[0].avg_rating || 0;

        const totalReviews =
            rows[0].total || 0;

        await pool.query(

            `UPDATE properties

            SET

                average_rating = ?,

                total_reviews = ?

            WHERE id = ?`,

            [

                averageRating,

                totalReviews,

                propertyId
            ]
        );
};

const getRatingBreakdown =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT

                rating,

                COUNT(*) AS total

            FROM reviews

            WHERE property_id = ?
            AND review_status = 'VISIBLE'

            GROUP BY rating

            ORDER BY rating DESC`,

            [propertyId]
        );

        return rows;
};

const getReviewAnalytics =
    async (propertyId) => {

        const [rows] = await pool.query(

            `SELECT

                AVG(rating)
                AS average_rating,

                COUNT(*) AS total_reviews,

                SUM(
                    CASE
                        WHEN rating = 5
                        THEN 1
                        ELSE 0
                    END
                ) AS five_star,

                SUM(
                    CASE
                        WHEN rating = 4
                        THEN 1
                        ELSE 0
                    END
                ) AS four_star,

                SUM(
                    CASE
                        WHEN rating = 3
                        THEN 1
                        ELSE 0
                    END
                ) AS three_star,

                SUM(
                    CASE
                        WHEN rating = 2
                        THEN 1
                        ELSE 0
                    END
                ) AS two_star,

                SUM(
                    CASE
                        WHEN rating = 1
                        THEN 1
                        ELSE 0
                    END
                ) AS one_star

            FROM reviews

            WHERE property_id = ?
            AND review_status = 'VISIBLE'`,

            [propertyId]
        );

        return rows[0];
};

const updateTrustScore =
    async (propertyId) => {

        const analytics =
            await getReviewAnalytics(
                propertyId
            );

        const averageRating =
            Number(
                analytics.average_rating || 0
            );

        const totalReviews =
            Number(
                analytics.total_reviews || 0
            );

        // BASIC TRUST FORMULA
        const trustScore =

            (
                averageRating * 20
            ) +

            Math.min(
                totalReviews,
                100
            );

        await pool.query(

            `UPDATE properties

            SET trust_score = ?

            WHERE id = ?`,

            [

                trustScore,

                propertyId
            ]
        );
};

const getReviewById =
    async (reviewId) => {

        const [rows] = await pool.query(

            `SELECT *

            FROM reviews

            WHERE id = ?`,

            [reviewId]
        );

        return rows[0];
};

const updateReviewStatus =
    async (
        reviewId,
        reviewStatus,
        moderationNotes = null
    ) => {

        await pool.query(

            `UPDATE reviews

            SET

                review_status = ?,

                moderation_notes = ?

            WHERE id = ?`,

            [

                reviewStatus,

                moderationNotes,

                reviewId
            ]
        );
};

const createReviewReport =
    async (reportData) => {

        const {

            review_id,

            reported_by,

            reason,

            additional_notes

        } = reportData;

        const [result] = await pool.query(

            `INSERT INTO review_reports (

                review_id,

                reported_by,

                reason,

                additional_notes

            )

            VALUES (?, ?, ?, ?)`,

            [

                review_id,

                reported_by,

                reason,

                additional_notes
            ]
        );

        return result;
};

const createOwnerResponse =
    async (responseData) => {

        const {

            review_id,

            owner_id,

            response_text

        } = responseData;

        const [result] = await pool.query(

            `INSERT INTO review_responses (

                review_id,

                owner_id,

                response_text

            )

            VALUES (?, ?, ?)`,

            [

                review_id,

                owner_id,

                response_text
            ]
        );

        return result;
};

const getReviewResponses =
    async (reviewId) => {

        const [rows] = await pool.query(

            `SELECT

                rr.response_text,

                rr.created_at,

                u.full_name AS owner_name

            FROM review_responses rr

            JOIN users u
            ON rr.owner_id = u.id

            WHERE rr.review_id = ?`,

            [reviewId]
        );

        return rows;
};

const getOwnerReviews =
    async (ownerId) => {

        const [rows] = await pool.query(

            `SELECT

                r.id,

                r.booking_id,

                r.property_id,

                r.room_id,

                r.user_id,

                r.rating,

                r.review_text,

                r.review_status,

                r.created_at,

                u.full_name,

                u.email AS user_email,

                b.booking_code,

                p.property_name,

                room.room_name,

                room.room_type

            FROM reviews r

            JOIN users u
            ON r.user_id = u.id

            JOIN bookings b
            ON r.booking_id = b.id

            JOIN properties p
            ON r.property_id = p.id

            JOIN room
            ON r.room_id = room.id

            WHERE p.owner_id = ?

            ORDER BY r.created_at DESC`,

            [ownerId]
        );

        return attachReviewExtras(rows);
};

module.exports = {

    createReview,

    createReviewPhotos,

    existingReview,

    getPropertyReviews,

    updatePropertyRatings,

    getRatingBreakdown,

    getReviewAnalytics,

    updateTrustScore,

    getReviewById,

    updateReviewStatus,

    createReviewReport,

    createOwnerResponse,

    getReviewResponses,

    getOwnerReviews

};
