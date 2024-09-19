const Joi = require('joi');

const createProviderSchema = Joi.object({
    provider: Joi.object({
        provider: Joi.string().strict().required()
    }).unknown(true)
})

const verifyProviderSchema = Joi.object({
    provider: Joi.string().strict().required()
})

const updateProviderSchema = Joi.object({
    provider: Joi.object({
        provider: Joi.string().strict().required()
    }).unknown(true)
})

module.exports = { createProviderSchema, verifyProviderSchema, updateProviderSchema }