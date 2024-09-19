const Joi = require('joi');

const getCustomersCallDetailsByFilters = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_range: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getCallDateHourWiseByFilters = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_company: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_range: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);
module.exports = { getCustomersCallDetailsByFilters, getCallDateHourWiseByFilters }