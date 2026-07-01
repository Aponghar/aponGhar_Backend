const Joi = require("joi");



const propertySchema = Joi.object({

    property_name:
        Joi.string()
            .min(3)
            .max(255)
            .required(),

    property_type:
        Joi.string()
            .required(),

    description:
        Joi.string()
            .allow("", null),

    location:
        Joi.string()
            .required(),

    address:
        Joi.string()
            .required(),

    city:
        Joi.string()
            .required(),

    state:
        Joi.string()
            .required(),

    country:
        Joi.string()
            .required(),

    zip_code:
        Joi.string()
            .allow("", null),

    latitude:
        Joi.number()
            .allow(null, ""),

    longitude:
        Joi.number()
            .allow(null, ""),

    google_maps_link:
        Joi.string()
            .allow("", null),

    check_in_time:
        Joi.string()
            .allow("", null),

    check_out_time:
        Joi.string()
            .allow("", null),

    check_in_time_hourly:
        Joi.string()
            .allow("", null),

    check_out_time_hourly:
        Joi.string()
            .allow("", null)
});


module.exports = { propertySchema };