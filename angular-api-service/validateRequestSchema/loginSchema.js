const Joi = require('joi');

const loginSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        // ip: Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }).required()
    }).unknown(true)
});

module.exports = loginSchema;
