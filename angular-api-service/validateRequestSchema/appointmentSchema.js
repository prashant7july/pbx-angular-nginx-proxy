const Joi = require('joi');

const getAppointmentIVRByFilters = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const createAppointmentIVR = Joi.object({
    ivrDetail: Joi.object({
        name: Joi.string().strict().optional(),
        welcome_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        invalid_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        timeout_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        digit_timeout: Joi.alternatives().try(Joi.number().strict()).optional(),
        inter_digit_timeout: Joi.alternatives().try(Joi.number().strict()).optional(),
        max_timeout_try: Joi.alternatives().try(Joi.number().strict()).optional(),
        max_invalid_try: Joi.alternatives().try(Joi.number().strict()).optional(),
        time_interval: Joi.alternatives().try(Joi.number().strict()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        open_time: Joi.string().strict().optional(),
        close_time: Joi.string().strict().optional(),
        time_break_start: Joi.string().strict().optional(),
        is_extension: Joi.alternatives().try(Joi.boolean().strict(), Joi.string().strict(), Joi.valid("")).optional(),
        is_pstn: Joi.alternatives().try(Joi.boolean().strict(), Joi.string().strict(), Joi.valid("")).optional(),
        extension: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).optional(),
        pstn: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).optional(),
        group: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const updateAppointmentIVR = Joi.object({
    ivrDetail: Joi.object({
        name: Joi.string().strict().optional(),
        welcome_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        invalid_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        timeout_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        digit_timeout: Joi.alternatives().try(Joi.number().strict()).optional(),
        inter_digit_timeout: Joi.alternatives().try(Joi.number().strict()).optional(),
        max_timeout_try: Joi.alternatives().try(Joi.number().strict()).optional(),
        max_invalid_try: Joi.alternatives().try(Joi.number().strict()).optional(),
        time_interval: Joi.alternatives().try(Joi.number().strict()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        open_time: Joi.string().strict().optional(),
        close_time: Joi.string().strict().optional(),
        time_break_start: Joi.string().strict().optional(),
        is_extension: Joi.alternatives().try(Joi.boolean().strict(), Joi.string().strict(), Joi.valid("")).optional(),
        is_pstn: Joi.alternatives().try(Joi.boolean().strict(), Joi.string().strict(), Joi.valid("")).optional(),
        extension: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).optional(),
        pstn: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).optional(),
        group: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict()), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getCdrByFilters = Joi.object({
    filter: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().allow('')).optional(),
        by_sellcost: Joi.string().allow('').optional(),
        by_src: Joi.string().allow('').optional(),
        by_dest: Joi.string().allow('').optional(),
        by_destination: Joi.alternatives().try( Joi.array().allow('')).optional(),
        by_callerid: Joi.string().allow('').optional(),
        by_terminatecause: Joi.number().allow('').optional(),
        by_appointment:  Joi.alternatives().try( Joi.number().allow('')).optional(),
        customer_id: Joi.alternatives().try( Joi.number().allow('')).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { getAppointmentIVRByFilters, createAppointmentIVR, updateAppointmentIVR, getCdrByFilters };