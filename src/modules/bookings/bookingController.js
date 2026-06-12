const bookingService =
    require("./bookingService");

const {
    bookingSchema
} = require("./bookingValidation");



const createBooking =
    async (req, res, next) => {

        try {

            const { error } =
                bookingSchema
                    .validate(req.body);

            if (error) {

                return res.status(400).json({

                    success: false,

                    message:
                        error.details[0].message
                });
            }

            const result =
                await bookingService
                    .createBooking(

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

const confirmBooking =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const result =
                await bookingService
                    .confirmBooking(
                        bookingId,
                        {
                            userId:
                                req.user.id,
                            role:
                                req.user.role
                        }
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};
const cancelBooking =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const result =
                await bookingService
                    .cancelBooking(

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

const rejectBookingRequest =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const result =
                await bookingService
                    .rejectBooking(
                        {
                            userId:
                                req.user.id,
                            role:
                                req.user.role
                        },
                        bookingId,
                        req.body?.reason || null
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getMyBookings =
    async (req, res, next) => {

        try {

            const bookings =
                await bookingService
                    .getMyBookings(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: bookings
            });

        } catch (error) {

            next(error);
        }
};

const getOwnerBookings =
    async (req, res, next) => {

        try {

            const bookings =
                await bookingService
                    .getPropertyBookings(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: bookings
            });

        } catch (error) {

            next(error);
        }
};

const getBookingDetails =
    async (req, res, next) => {

        try {

            const { bookingId } =
                req.params;

            const booking =
                await bookingService
                    .getBookingInfo(

                        req.user.id,

                        bookingId
                    );

            res.status(200).json({

                success: true,

                data: booking
            });

        } catch (error) {

            next(error);
        }
};

module.exports = {

    createBooking,

    confirmBooking,

    cancelBooking,

    rejectBookingRequest,

    getMyBookings,

    getOwnerBookings,

    getBookingDetails
};
