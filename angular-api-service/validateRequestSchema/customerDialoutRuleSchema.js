const Joi = require('joi');

const filterDialoutRule = Joi.object({
    filters: Joi.object({
        dialout_pattern: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        exceptional_rule: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true),    
    customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

module.exports =  { filterDialoutRule }