const Joi = require('joi');

const verifyUsername = Joi.object({
    username: Joi.string().required()
}).unknown(true)

module.exports = verifyUsername