const Joi = require('joi');

const saveCallGroup = Joi.object({
        groupName: Joi.string().strict().allow(null, '').optional(),
        groupType: Joi.number().strict().allow(null).optional(),
        extNo: Joi.number().strict().allow(null, '').optional(),
        ringTimeout: Joi.number().strict().allow(null,'').optional(),
        recording: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid(null).optional()
        ),
        sticky_agent: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid("").optional()
        ),
        prompt: Joi.number().strict().allow(null,'').optional(),
        unauthorized_fail: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid("").optional()
        ),
        active_feature: Joi.string().strict().allow(null, '').optional(),
        active_feature_value: Joi.alternatives().try(
            Joi.string().strict(),
            Joi.number().strict(),
            Joi.array().items(Joi.string()).single(),
            Joi.valid(""),
            Joi.valid([]).optional()
        ),
        sticky_expire: Joi.number().strict().allow(null, '').optional(),
        customer_id: Joi.number().strict().required(),
        id: Joi.allow(null,'').optional(),
        sipExt: Joi.string().strict().allow(null, '').optional(),
        prompt_name: Joi.string().strict().allow(null, '').optional(),
        feature_name: Joi.string().strict().allow(null, '').optional(),
        feature_value: Joi.string().strict().allow(null, '').optional(),
     // Allow additional unknown keys
}).unknown(true)
const deleteCallgroup = Joi.object({
    id: Joi.number().strict()
});
const getCallgroup = Joi.object({
    customer_id: Joi.number().strict(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
});
const getCallgroupByFilters = Joi.object({
    customer_id: Joi.number().strict(),
    filters: Joi.object({
    group_ext: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    group_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null))
    }).unknown(true)
});
module.exports = { saveCallGroup,deleteCallgroup,getCallgroup,getCallgroupByFilters}