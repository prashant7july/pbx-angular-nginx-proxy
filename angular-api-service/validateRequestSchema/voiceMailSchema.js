const Joi = require('joi');

const voiceMailById = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const createVoiceMail = Joi.object({
    voicemail: Joi.object({        
        extension_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        otherEmail: Joi.string().email().strict(),
    }).unknown(true)
}).unknown(true);

module.exports = { voiceMailById, createVoiceMail }