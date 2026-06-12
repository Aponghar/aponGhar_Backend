const Joi = require("joi");

const roomSchema = Joi.object({
    room_id: Joi.string().trim().min(3).max(50).optional(),
    room_name: Joi.string().min(3).max(255).required(),
    room_type: Joi.string().required(),
    description: Joi.string().allow("", null).optional(),
    max_adults: Joi.number().min(1).required(),
    max_children: Joi.number().min(0).required(),
    bed_type: Joi.string().allow("", null).optional(),
    room_size: Joi.string().allow("", null).optional(),
    room_amenities: Joi.array().items(Joi.number()).optional().default([]),
    room_benefits: Joi.array().items(Joi.string().trim().max(120)).max(10).optional().default([]),
    price_type: Joi.string().valid("PER_NIGHT", "HOURLY", "BOTH").required(),
    base_price: Joi.number().positive().required(),
    price_per_night: Joi.number().positive().optional(),
    price_3hours: Joi.number().positive().optional(),
    price_6hours: Joi.number().positive().optional(),
    price_9hours: Joi.number().positive().optional()
});

const bulkRoomSchema = Joi.object({
    rooms: Joi.array().items(roomSchema).min(1).required()
});

module.exports = {
    roomSchema,
    bulkRoomSchema
};
