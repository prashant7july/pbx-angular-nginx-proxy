const Joi = require('joi');

const getExtensionSetting = Joi.object({
    id: Joi.number().strict()
}).unknown(true);

const updateExtensionSettings = Joi.object({
    extension: Joi.object({
        // dnd: Joi.alternatives().try(Joi.boolean(), Joi.valid("")).optional(),
        ringtone: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        callForward: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const filterExtension = Joi.object({
    filters: Joi.object({
        by_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).required(),
        by_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).required(),
        by_roaming: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const extensionFMFMSetting = Joi.object({
    id: Joi.number()
}).unknown(true);

const getExtensionFeaturesByFilters = Joi.object({
    filters: Joi.object({
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).required(),
        by_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).required(),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).required()
    }).unknown(true)
}).unknown(true);

const getExtensionForSupport = Joi.object({
    filters: Joi.object({
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).required(),
        by_number: Joi.alternatives().try(Joi.array().strict(), Joi.valid(null)).required(),
        by_username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).required(),
        by_external_callerId: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).required(),
    }).unknown(true)
}).unknown(true);

const extensionAssignMinutes = Joi.object({
    customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    ext_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

module.exports = { getExtensionForSupport, getExtensionSetting, updateExtensionSettings, filterExtension, extensionFMFMSetting ,getExtensionFeaturesByFilters, extensionAssignMinutes }