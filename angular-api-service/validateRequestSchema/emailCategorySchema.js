const Joi = require('joi');

const filterEmailCategory = Joi.object({
    filters: Joi.object({
        by_category: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_product: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const getEmailTemplateByFilters = Joi.object({
    filters: Joi.object({
        by_category: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_product: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const createEmailTemplate = Joi.object({
    emailTemplate: Joi.object({
        category: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        content: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        emailTitle: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        image: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const checkMultipleStatus = Joi.object({
    email_category_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
    status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
}).unknown(true);

const updateEmailTemplateStatus = Joi.object({
    email_category_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
    status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
}).unknown(true);


module.exports = { filterEmailCategory, getEmailTemplateByFilters, createEmailTemplate, checkMultipleStatus, updateEmailTemplateStatus }