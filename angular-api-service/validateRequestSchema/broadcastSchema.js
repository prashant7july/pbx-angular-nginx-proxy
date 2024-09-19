const Joi = require('joi');

const getBC = Joi.object({
    by_schduler: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
}).unknown(true);

const updateBC = Joi.object({
    name: Joi.string().required(),
    welcome_prompt: Joi.number().integer().required(),
    scheduler: Joi.number().integer().required(),
    schedular_start_date: Joi.string().allow(''),
    is_extension: Joi.boolean().required(),
    is_pstn: Joi.alternatives().try(Joi.boolean(), Joi.string().valid("")).required(),
    extension: Joi.array().items(Joi.number().integer()).required(),
    pstn: Joi.array().items(Joi.any()).required(),
    group: Joi.alternatives().try(Joi.array().items(Joi.number().integer()), Joi.string().valid("")).required(),
    caller_id_ext: Joi.number().integer().allow([]).required(),
    caller_id_pstn: Joi.alternatives().try(Joi.number().integer(), Joi.string().valid("").allow([])).required(),
    attempts: Joi.number().integer().required(),
    hours: Joi.number().integer().required(),
    minutes: Joi.number().integer().required(),
    try_interval: Joi.string().required(),
    prompt_name: Joi.string().required(),
    caller_id_ext_name: Joi.string().required(),
    ext_name: Joi.array().items(Joi.string()).required(),
    caller_id_pstn_name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
    pstn_name: Joi.array().items(Joi.string()).required(),
    customerId: Joi.number().integer().required(),
    id: Joi.number().integer().required()
}).unknown(true);

const addBC = Joi.object({
    name: Joi.string().required(),
    welcome_prompt: Joi.number().integer().required(),
    scheduler: Joi.number().integer().required(),
    schedular_start_date: Joi.date().iso().allow('').required(),
    is_extension: Joi.boolean().allow('').required(),
    is_pstn: Joi.boolean().allow('').required(),
    extension: Joi.array().items(Joi.number().integer()).required(),
    pstn: Joi.array().items(Joi.number().integer()).required(),
    group: Joi.array().items(Joi.number().integer()).allow('').required(),
    caller_id_ext: Joi.number().integer().allow('').required(),
    caller_id_pstn: Joi.number().integer().allow('').required(),
    attempts: Joi.number().integer().required(),
    hours: Joi.number().integer().required(),
    minutes: Joi.number().integer().required(),
    try_interval: Joi.string().required(),
    prompt_name: Joi.string().required(),
    caller_id_ext_name: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).required(),
    ext_name: Joi.array().items(Joi.string()).required(),
    caller_id_pstn_name: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ).required(),
    pstn_name: Joi.array().items(Joi.string()).required(),
    customerId: Joi.number().integer().required()
});

const partiallyUpdateBC = Joi.object({
    status: Joi.alternatives().try(Joi.number().strict()).required(),
}).unknown(true);

const getCdrByFilters = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(
            Joi.array().items(Joi.date().iso()),
            Joi.string().allow('')
        ).required(),
        by_sellcost: Joi.number().allow('').required(),
        by_src: Joi.number().allow('').required(),
        by_dest: Joi.number().allow('').required(),
        by_destination: Joi.array().items(Joi.number().integer()).required(),
        by_callerid: Joi.number().allow('').required(),
        by_terminatecause: Joi.array().items(Joi.number().integer()).required(),
        by_bc: Joi.array().items(Joi.number().integer()).required(),
        customer_id: Joi.alternatives().try(
            Joi.number().integer()
        ).required()
    }).unknown(true)
}).unknown(true);

module.exports = { getBC, updateBC, addBC, getCdrByFilters, partiallyUpdateBC }