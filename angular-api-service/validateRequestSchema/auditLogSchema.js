const Joi = require('joi');

const getAllPackageAuditLogByFilter = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_pckg: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const getAuditLogByFilter = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getApiLogByFilter = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_responsecode: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_username: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const getSmtpAuditLogByFilter = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_template: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { getAllPackageAuditLogByFilter, getAuditLogByFilter, getApiLogByFilter, getSmtpAuditLogByFilter }