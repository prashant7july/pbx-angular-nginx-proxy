const Joi = require('joi');

const viewCallForwardById = Joi.object({
    id: Joi.number().strict()
}).unknown(true);

module.exports = { viewCallForwardById }