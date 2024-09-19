const Joi = require('joi');

const createImGroup = Joi.object({
    ext_name: Joi.number().strict(),
    sip: Joi.array().items(Joi.alternatives().try(Joi.number().strict())).optional(),    
}).unknown(true);

const filterImGroup = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
        by_sip: Joi.alternatives().try(Joi.array().items(Joi.number().strict()), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { createImGroup, filterImGroup }