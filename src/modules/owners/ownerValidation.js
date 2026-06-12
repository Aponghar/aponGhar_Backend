const Joi = require("joi");



const ownerApplicationSchema =
    Joi.object({

        property_name:
            Joi.string()
                .min(3)
                .max(255)
                .required(),

        property_type:
            Joi.string()
                .required(),

        location:
            Joi.string()
                .required(),

        area:
            Joi.string()
                .allow("", null),

        owner_name:
            Joi.string()
                .required(),

        contact_number:
            Joi.string()
                .required(),

        description:
            Joi.string()
                .allow("", null)
    });



module.exports = {
    ownerApplicationSchema
};