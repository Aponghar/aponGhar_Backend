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

const manualCheckinSchema = Joi.object({
  assigned_room_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "Room ID must be a number",
      "any.required": "Room ID is required",
    }),
  guest_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Guest name is required",
      "any.required": "Guest name is required",
    }),
  guest_email: Joi.string()
    .trim()
    .email()
    .max(150)
    .allow(null, "")
    .optional(),
  guest_phone: Joi.string()
    .trim()
    .min(5)
    .max(20)
    .allow(null, "")
    .optional(),
  check_in_date: Joi.date()
    .iso()
    .required()
    .messages({
      "any.required": "Check-in date is required",
    }),
  check_out_date: Joi.date()
    .iso()
    .required()
    .messages({
      "any.required": "Check-out date is required",
    }),
  guests: Joi.number()
    .integer()
    .positive()
    .default(1),
});

module.exports = {
  checkinSchema,
  ownerCheckinSchema,
  manualCheckinSchema,
};
