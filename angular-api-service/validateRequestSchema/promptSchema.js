const Joi = require('joi');

const updatePrompt = Joi.object({
    prompt: Joi.object({
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        promptType: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        prompt_description: Joi.alternatives().try(Joi.string().strict(), Joi.valid(null),  Joi.valid('')).optional(),
        prompt_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        prompt: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        promtTypeId: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const getPromptByFilters = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

module.exports = { updatePrompt, getPromptByFilters }