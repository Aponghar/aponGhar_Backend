const Joi = require("joi");



const reviewSchema = Joi.object({

    booking_id:
        Joi.number()
            .required(),

    rating:
        Joi.number()
            .min(1)
            .max(5)
            .required(),

    review_text:
        Joi.string()
            .trim()
            .min(5)
            .max(2000)
            .allow("", null),

    photo_urls:
        Joi.array()
            .items(Joi.string().trim().max(500))
            .optional()
});

const reportSchema = Joi.object({

    review_id:
        Joi.number()
            .required(),

    reason:
        Joi.string()
            .trim()
            .min(3)
            .max(100)
            .required(),

    additional_notes:
        Joi.string()
            .trim()
            .max(1000)
            .allow("", null)
});

const moderationSchema = Joi.object({

    review_status:
        Joi.string()
            .valid(
                "VISIBLE",
                "HIDDEN",
                "PENDING",
                "REJECTED"
            )
            .required(),

    moderation_notes:
        Joi.string()
            .trim()
            .max(1000)
            .allow("", null)
});

const responseSchema = Joi.object({

    response_text:
        Joi.string()
            .trim()
            .min(3)
            .max(2000)
            .required()
});



module.exports = {
    reviewSchema,
    reportSchema,
    moderationSchema,
    responseSchema
};
