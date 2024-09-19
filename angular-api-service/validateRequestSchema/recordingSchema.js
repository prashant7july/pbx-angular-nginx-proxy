const Joi = require('joi');

const recordingList = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
}).unknown(true);

const filterRecordingList = Joi.object({
    filters: Joi.object({
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)).optional(),        
        role: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)).optional(),
    }).unknown(true)
}).unknown(true);

const deleteRecording = Joi.object({
    filename: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
}).unknown(true);

module.exports = { recordingList, filterRecordingList, deleteRecording }