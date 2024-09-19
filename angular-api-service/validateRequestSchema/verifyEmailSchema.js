const Joi = require('joi');

const verifyEmail = Joi.object({    
    email: Joi.string().email().required()
}).unknown(true);

module.exports = verifyEmail;
