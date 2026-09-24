const Joi = require("joi");



const registerSchema = Joi.object({

    full_name: Joi.string().min(3).max(100).required(),

    email: Joi.string().email().required(),

    phone: Joi.string().min(10).max(20).required(),

    password: Joi.string().min(6).required()
});



const loginSchema = Joi.object({

    email: Joi.string().email().required(),

    password: Joi.string().required()
});


const googleSchema = Joi.object({
    id_token: Joi.string(),
    credential: Joi.string()
}).or("id_token", "credential");



module.exports = {
    registerSchema,
    loginSchema,
    googleSchema
};