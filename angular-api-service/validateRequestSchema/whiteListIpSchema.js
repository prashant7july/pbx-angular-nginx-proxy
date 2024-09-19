const Joi = require('joi');

const createWhiteListContact = Joi.object({
    whiteList: Joi.object({
        name: Joi.alternatives().try(Joi.string().strict()).optional(),
        phone: Joi.alternatives().try(Joi.string().strict()).optional(),
        phone2: Joi.alternatives().try(Joi.string().strict()).optional(),
        country: Joi.alternatives().try(Joi.number().strict()).optional(),
        country_code: Joi.alternatives().try(Joi.string().strict(), Joi.valid('')).optional(),
        numberFormat: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(1), Joi.valid(0)).optional(),
        status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        role: Joi.alternatives().try(Joi.number().strict()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        extension_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        country_name: Joi.alternatives().try(Joi.string().strict()).optional(),
    }).unknown(true)
}).unknown(true);

const updateWhiteListContactStatus = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict()).optional(),
    status: Joi.alternatives().try(Joi.number().strict()).optional(),
}).unknown(true);

const getblockedIP = Joi.object({
    ip: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),
    created_at: Joi.alternatives().try(Joi.array().strict(),Joi.valid("")).optional(),
}).unknown(true);

module.exports = { createWhiteListContact, updateWhiteListContactStatus , getblockedIP}