const Joi = require("joi");

const bookingSchema = Joi.object({
    room_id: Joi.number().positive().required(),

    booking_type: Joi.string()
        .valid("NIGHTLY", "HOURLY")
        .default("NIGHTLY"),

    pricing_option: Joi.string()
        .valid("PER_NIGHT", "HOUR_3", "HOUR_6", "HOUR_9", "BASE")
        .default("PER_NIGHT"),

    check_in_date: Joi.date().iso().required(),

    check_out_date: Joi.date().iso().required(),

    check_in_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):00$/)
        .required(),

    check_out_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):00$/)
        .allow("", null)
        .optional(),

    guests: Joi.number().positive().max(20).required(),

    booked_rooms: Joi.number().positive().required(),

    guest_name: Joi.string().trim().min(2).max(150).required(),

    guest_email: Joi.string().email().max(150).required(),

    guest_age: Joi.number().integer().min(1).max(120).required(),

    customer_name: Joi.string().trim().min(2).max(150).required(),

    special_requests: Joi.string().allow("", null).max(500),

    coupon_code: Joi.string().optional().allow("", null).trim().max(50),

    use_wallet: Joi.boolean().optional(),

    payment_method: Joi.string()
        .valid("ONLINE", "OFFLINE")
        .default("OFFLINE")
}).custom((value, helpers) => {
    const checkIn = new Date(value.check_in_date);
    const checkOut = new Date(value.check_out_date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDateLocal = new Date(
        checkIn.getUTCFullYear(),
        checkIn.getUTCMonth(),
        checkIn.getUTCDate()
    );

    if (checkInDateLocal < today) {
        return helpers.message("Check-in date cannot be before today");
    }

    if (value.booking_type === "NIGHTLY" && checkOut <= checkIn) {
        return helpers.message("Check-out date must be after check-in date");
    }

    if (value.booking_type === "HOURLY" && checkOut < checkIn) {
        return helpers.message("Check-out date cannot be before check-in date");
    }

    if (
        value.booking_type === "NIGHTLY" &&
        !["PER_NIGHT", "BASE"].includes(value.pricing_option)
    ) {
        return helpers.message("Nightly bookings must use nightly pricing");
    }

    if (
        value.booking_type === "HOURLY" &&
        !["HOUR_3", "HOUR_6", "HOUR_9"].includes(value.pricing_option)
    ) {
        return helpers.message("Hourly bookings must use hourly pricing");
    }

    return value;
}, "booking date and pricing validation");

// Booking ID validation
const bookingIdSchema = Joi.object({
    bookingId: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'Booking ID must be a positive number',
            'any.required': 'Booking ID is required'
        })
});

// Generic ID validation for routes
const idParamSchema = Joi.object({
    id: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'ID must be a positive number',
            'any.required': 'ID is required'
        })
});

// Pagination schema for list endpoints
const paginationSchema = Joi.object({
    page: Joi.number()
        .positive()
        .optional()
        .default(1),
    limit: Joi.number()
        .positive()
        .max(100)
        .optional()
        .default(10),
    sort: Joi.string()
        .optional()
        .pattern(/^[a-z_]+$/i),
    order: Joi.string()
        .optional()
        .valid('ASC', 'DESC')
        .default('DESC')
});

module.exports = {
    bookingSchema,
    bookingIdSchema,
    idParamSchema,
    paginationSchema
};
