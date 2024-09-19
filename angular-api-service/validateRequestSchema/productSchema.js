const Joi = require('joi');

const filterPackage = Joi.object({
    filters: Joi.object({
        by_billing_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_call_plan: Joi.alternatives().try(Joi.array().items(Joi.number().strict(), Joi.valid(""))).optional(),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_product: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { filterPackage }