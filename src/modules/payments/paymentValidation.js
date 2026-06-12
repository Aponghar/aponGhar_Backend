const Joi = require('joi');

// Razorpay payment verification schema
const paymentVerificationSchema = Joi.object({
    razorpay_order_id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Razorpay order ID is required',
            'any.required': 'Razorpay order ID is required'
        }),
    razorpay_payment_id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Razorpay payment ID is required',
            'any.required': 'Razorpay payment ID is required'
        }),
    razorpay_signature: Joi.string()
        .required()
        .messages({
            'string.empty': 'Razorpay signature is required',
            'any.required': 'Razorpay signature is required'
        }),
    payment_method: Joi.string()
        .optional()
        .valid('netbanking', 'card', 'upi', 'wallet')
}).unknown(true);

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

// ID parameter validation (generic)
const idParamSchema = Joi.object({
    id: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'ID must be a positive number',
            'any.required': 'ID parameter is required'
        })
});

module.exports = {
    paymentVerificationSchema,
    bookingIdSchema,
    idParamSchema
};
