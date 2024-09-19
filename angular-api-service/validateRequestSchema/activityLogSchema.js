const Joi = require('joi');

const getActivityLogByFilter = Joi.object({
    user_id: Joi.string().strict().required(),
    user_type: Joi.string().strict().required(),
    filters: Joi.object({
        by_logs: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_ip: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { getActivityLogByFilter };