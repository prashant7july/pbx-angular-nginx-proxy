const Joi = require('joi');

const viewSpeedDialById = Joi.object({
    id: Joi.number().strict().required()
}).unknown(true);

const createSpeedDial = Joi.object({
    extid: Joi.number().strict().required(),
    arr_val: Joi.string().strict()
}).unknown(true);

module.exports = { viewSpeedDialById, createSpeedDial }