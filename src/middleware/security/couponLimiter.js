const rateLimit =
    require("express-rate-limit");



const couponLimiter =
    rateLimit({

        windowMs:
            10 * 60 * 1000,

        max: 30,

        message: {

            success: false,

            message:
                "Too many coupon requests."
        }
    });



module.exports =
    couponLimiter;