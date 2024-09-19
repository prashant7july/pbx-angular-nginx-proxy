const Joi = require('joi');
const { valid } = require('./verifyEmailSchema');

const deleteWhiteIP = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
}).unknown(true);

const getBlackListByFilters = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),
    filters: Joi.object({
        by_blocked_for: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(0)).optional(),
        by_country: Joi.alternatives().try(Joi.number().strict(), Joi.valid([]), Joi.valid(""), Joi.valid(0)).optional(),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_number: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
});

const createBlackListContact = Joi.object({
    blackList: Joi.object({
        name: Joi.string().strict().optional(),
        phone: Joi.alternatives().try(Joi.string().strict()).optional(),
        phone2: Joi.alternatives().try(Joi.string().strict()).optional(),
        country: Joi.alternatives().try(Joi.number().strict()).optional(),
        country_code: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        numberFormat: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(0,1)).optional(),
        status: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        blockFor: Joi.alternatives().try(Joi.number().strict()).optional(),
        role: Joi.alternatives().try(Joi.number().strict()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        extension_id: Joi.alternatives().try(Joi.number().strict()).default(0).optional(),
        id: Joi.alternatives().try(Joi.number().strict().allow(null)).optional(),
        country_name: Joi.string().strict().optional()
    }).unknown(true)
}).unknown(true);

module.exports = {
    deleteWhiteIP,
    getBlackListByFilters,
    createBlackListContact
}