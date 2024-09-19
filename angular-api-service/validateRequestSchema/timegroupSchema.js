const Joi = require('joi');

const createTimeGroup = Joi.object({
    timeGroup: Joi.object({
        name: Joi.string().strict().required(),
        time_finish: Joi.string().strict(),
        time_start: Joi.string().strict(),
        month_day_start_finish: Joi.alternatives().try(Joi.array().strict(), Joi.valid('')).optional(),
        sch_duration: Joi.string().strict(),
        sch_weekly: Joi.string().strict(),
        holidays: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(''), Joi.valid(1), Joi.valid(0)).optional(),
        prompt: Joi.number().strict(),
        failover_destination: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid('')).optional(),
        active_feature: Joi.alternatives().try(Joi.string().strict(), Joi.valid('')).optional(),
        active_feature_value: Joi.alternatives().try(Joi.number().strict(), Joi.valid('')).optional(),
        role: Joi.number().strict(),
        customer_id: Joi.number().strict(),
        extension_id: Joi.number().strict(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
        feature_name: Joi.alternatives().try(
            Joi.string().strict(),
            Joi.array().items(Joi.string()).single(),
            Joi.valid(""),
            Joi.valid([])
        ),
    }).unknown(true)
})
const getTimeGroupFilters = Joi.object({
    id: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid('')).optional(),
        by_range: Joi.alternatives().try(Joi.array().strict(), Joi.valid('')).optional(),
        by_custom: Joi.alternatives().try(Joi.string().strict(), Joi.valid('')).optional(),
    }).unknown(true)
})
const deleteTimeGroup = Joi.object({
    id: Joi.number().strict()
});

const viewTimeGroup = Joi.object({
    extension_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);


module.exports = { createTimeGroup, deleteTimeGroup, getTimeGroupFilters, viewTimeGroup }