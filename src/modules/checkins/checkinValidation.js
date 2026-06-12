const Joi = require("joi");

const checkinSchema = Joi.object({
  booking_id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": "Booking ID must be a number",
      "any.required": "Booking ID is required",
    }),
});

const ownerCheckinSchema = Joi.object({
  booking_code: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Booking code is required",
      "any.required": "Booking code is required",
    }),
  assigned_room_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Room ID must be a number",
      "any.required": "Room ID is required",
    }),
});

module.exports = {
  checkinSchema,
  ownerCheckinSchema,
};
