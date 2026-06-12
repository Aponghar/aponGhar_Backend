const rateLimit =
    require("express-rate-limit");



const bookingLimiter =
    rateLimit({

        windowMs:
            10 * 60 * 1000,

        max: 15,

        message: {

            success: false,

            message:
                "Too many booking attempts."
        }
    });



module.exports =
    bookingLimiter;