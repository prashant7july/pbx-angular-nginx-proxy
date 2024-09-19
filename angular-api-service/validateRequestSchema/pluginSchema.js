const Joi = require('joi');

const filterPluginCdr = Joi.object({
    filters: Joi.object({
        by_buycost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_destination: Joi.alternatives().try(Joi.array().items(Joi.number().strict(), Joi.valid()), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const customerPlugin = Joi.object({
    id: Joi.number().strict()
}).unknown(true)

module.exports = { filterPluginCdr, customerPlugin }