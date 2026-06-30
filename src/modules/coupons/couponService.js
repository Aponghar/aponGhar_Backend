const couponRepository =
    require("./couponRepository");

const propertyRepository =
    require("../properties/propertyRepository");

const createCoupon =
    async (
        user,
        couponData
    ) => {

        const ownerId = user.id;
        const userRole = user.role;

        if (userRole === "ADMIN") {
            // Admin global coupons apply to all properties
            couponData.property_id = null;
            couponData.once_per_user = true;
        } else {
            // For OWNER, verify property ownership
            if (!couponData.property_id) {
                throw new Error("Property selection is required");
            }
            const property =
                await propertyRepository
                    .getPropertyById(
                        couponData.property_id
                    );

            if (!property) {
                throw new Error(
                    "Property not found"
                );
            }

            if (
                property.owner_id !== ownerId
            ) {
                throw new Error(
                    "Unauthorized coupon creation"
                );
            }
            couponData.once_per_user = false;
        }

        // CHECK DUPLICATE CODE
        const existing =
            await couponRepository
                .getCouponByCode(
                    couponData.coupon_code
                );

        if (existing) {

            throw new Error(
                "Coupon code already exists"
            );
        }

        couponData.owner_id =
            ownerId;

        await couponRepository
            .createCoupon(
                couponData
            );

        return {

            message:
                "Coupon created successfully"
        };
};

const validateCoupon =
    async (
        couponCode,
        propertyId,
        bookingAmount,
        userId
    ) => {

        const coupon =
            await couponRepository
                .getCouponByCode(
                    couponCode
                );

        if (!coupon) {

            throw new Error(
                "Invalid coupon"
            );
        }

        // ACTIVE CHECK
        if (!coupon.is_active) {

            throw new Error(
                "Coupon inactive"
            );
        }

        // PROPERTY CHECK (only if not a global coupon)
        if (
            coupon.property_id !== null &&
            coupon.property_id !== Number(propertyId)
        ) {

            throw new Error(
                "Coupon not valid for this property"
            );
        }

        // DATE CHECK
        const now =
            new Date();

        if (
            now < new Date(coupon.start_date) ||
            now > new Date(coupon.expiry_date)
        ) {

            throw new Error(
                "Coupon expired"
            );
        }

        // MINIMUM AMOUNT CHECK
        if (
            bookingAmount <
            coupon.minimum_booking_amount
        ) {

            throw new Error(
                `Minimum booking amount is ₹${coupon.minimum_booking_amount}`
            );
        }

        // USAGE LIMIT CHECK
        if (

            coupon.usage_limit &&

            coupon.used_count >=
            coupon.usage_limit
        ) {

            throw new Error(
                "Coupon usage limit reached"
            );
        }

        // ONCE PER USER CHECK (for admin/once_per_user coupons)
        if (coupon.once_per_user && userId) {
            const usageCount =
                await couponRepository
                    .getUserCouponUsageCount(
                        coupon.id,
                        userId
                    );

            if (usageCount > 0) {
                throw new Error(
                    "You have already used this coupon code"
                );
            }
        }

        return coupon;
};

const calculateCouponDiscount =
    (
        coupon,
        bookingAmount
    ) => {

        let discount = 0;
        const discountValue = Number(coupon.discount_value);

        // PERCENTAGE
        if (
            coupon.discount_type ===
            "PERCENTAGE"
        ) {

            discount =

                (
                    bookingAmount *
                    discountValue
                ) / 100;

            // MAX DISCOUNT CHECK
            if (

                coupon.maximum_discount_amount &&

                discount >
                Number(coupon.maximum_discount_amount)
            ) {

                discount =
                    Number(coupon.maximum_discount_amount);
            }
        }

        // FIXED
        if (
            coupon.discount_type ===
            "FIXED"
        ) {

            discount =
                discountValue;
        }

        return Number(
            discount.toFixed(2)
        );
};

const getOwnerCoupons =
    async (ownerId) => {

        const coupons =
            await couponRepository
                .getCouponsByOwner(
                    ownerId
                );

        const now = new Date();

        return coupons.map(
            (coupon) => {

                let status = "ACTIVE";

                if (!coupon.is_active) {
                    status = "INACTIVE";
                } else if (
                    now > new Date(coupon.expiry_date)
                ) {
                    status = "EXPIRED";
                } else if (
                    coupon.usage_limit &&
                    coupon.used_count >=
                    coupon.usage_limit
                ) {
                    status = "EXHAUSTED";
                } else if (
                    now < new Date(coupon.start_date)
                ) {
                    status = "SCHEDULED";
                }

                return {
                    ...coupon,
                    computed_status: status
                };
            }
        );
};

const getCouponDetails =
    async (user, couponId) => {

        const coupon =
            await couponRepository
                .getCouponById(couponId);

        if (!coupon) {

            throw new Error(
                "Coupon not found"
            );
        }

        if (coupon.owner_id !== user.id && user.role !== "ADMIN") {

            throw new Error(
                "Unauthorized access"
            );
        }

        const stats =
            await couponRepository
                .getCouponStats(couponId);

        const usages =
            await couponRepository
                .getCouponUsages(couponId);

        const now = new Date();

        let computed_status = "ACTIVE";

        if (!coupon.is_active) {
            computed_status = "INACTIVE";
        } else if (
            now > new Date(coupon.expiry_date)
        ) {
            computed_status = "EXPIRED";
        } else if (
            coupon.usage_limit &&
            coupon.used_count >=
            coupon.usage_limit
        ) {
            computed_status = "EXHAUSTED";
        } else if (
            now < new Date(coupon.start_date)
        ) {
            computed_status = "SCHEDULED";
        }

        return {
            ...coupon,
            computed_status,
            stats,
            usages
        };
};

const toggleCoupon =
    async (user, couponId) => {

        const coupon =
            await couponRepository
                .getCouponById(couponId);

        if (!coupon) {

            throw new Error(
                "Coupon not found"
            );
        }

        if (coupon.owner_id !== user.id && user.role !== "ADMIN") {

            throw new Error(
                "Unauthorized access"
            );
        }

        const newStatus =
            !coupon.is_active;

        await couponRepository
            .toggleCouponStatus(
                couponId,
                newStatus
            );

        return {

            message: newStatus
                ? "Coupon activated"
                : "Coupon deactivated",

            is_active: newStatus
        };
};

const removeCoupon =
    async (user, couponId) => {

        const coupon =
            await couponRepository
                .getCouponById(couponId);

        if (!coupon) {

            throw new Error(
                "Coupon not found"
            );
        }

        if (coupon.owner_id !== user.id && user.role !== "ADMIN") {

            throw new Error(
                "Unauthorized access"
            );
        }

        await couponRepository
            .deleteCoupon(couponId);

        return {

            message:
                "Coupon deleted successfully"
        };
};

const getApplicableCoupons =
    async (propertyId, userId) => {

        const coupons =
            await couponRepository
                .getApplicableCouponsForProperty(propertyId);

        const filteredCoupons = [];

        for (const coupon of coupons) {
            if (coupon.once_per_user && userId) {
                const usageCount =
                    await couponRepository
                        .getUserCouponUsageCount(
                            coupon.id,
                            userId
                        );

                if (usageCount > 0) {
                    continue;
                }
            }
            filteredCoupons.push(coupon);
        }

        return filteredCoupons;
};

module.exports = {

    createCoupon,

    validateCoupon,

    calculateCouponDiscount,

    getOwnerCoupons,

    getCouponDetails,

    toggleCoupon,

    removeCoupon,

    getApplicableCoupons
};