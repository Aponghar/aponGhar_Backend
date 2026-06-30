const couponService =
    require("./couponService");

const createCoupon =
    async (req, res, next) => {

        try {

            const result =
                await couponService
                    .createCoupon(

                        req.user,

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

const validateCoupon =
    async (req, res, next) => {

        try {

            const {

                coupon_code,

                property_id,

                booking_amount

            } = req.body;

            const coupon =
                await couponService
                    .validateCoupon(

                        coupon_code,

                        property_id,

                        booking_amount,

                        req.user.id
                    );

            const discount =
                couponService
                    .calculateCouponDiscount(

                        coupon,

                        booking_amount
                    );

            res.status(200).json({

                success: true,

                data: {

                    coupon,

                    discount
                }
            });

        } catch (error) {

            next(error);
        }
};

const getOwnerCoupons =
    async (req, res, next) => {

        try {

            const coupons =
                await couponService
                    .getOwnerCoupons(
                        req.user.id
                    );

            res.status(200).json({

                success: true,

                data: coupons
            });

        } catch (error) {

            next(error);
        }
};

const getCouponDetails =
    async (req, res, next) => {

        try {

            const details =
                await couponService
                    .getCouponDetails(

                        req.user,

                        req.params.id
                    );

            res.status(200).json({

                success: true,

                data: details
            });

        } catch (error) {

            next(error);
        }
};

const toggleCoupon =
    async (req, res, next) => {

        try {

            const result =
                await couponService
                    .toggleCoupon(

                        req.user,

                        req.params.id
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const deleteCoupon =
    async (req, res, next) => {

        try {

            const result =
                await couponService
                    .removeCoupon(

                        req.user,

                        req.params.id
                    );

            res.status(200).json({

                success: true,

                data: result
            });

        } catch (error) {

            next(error);
        }
};

const getApplicableCoupons =
    async (req, res, next) => {

        try {

            const { propertyId } = req.params;

            const coupons =
                await couponService
                    .getApplicableCoupons(
                        propertyId,
                        req.user?.id
                    );

            res.status(200).json({

                success: true,

                data: coupons
            });

        } catch (error) {

            next(error);
        }
};

module.exports = {

    createCoupon,

    validateCoupon,

    getOwnerCoupons,

    getCouponDetails,

    toggleCoupon,

    deleteCoupon,

    getApplicableCoupons
};