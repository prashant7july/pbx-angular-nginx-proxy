const Joi = require('joi');

const notificationAsRead = Joi.object({
    loginId: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid('')).optional()
}).unknown(true);

module.exports = { notificationAsRead }