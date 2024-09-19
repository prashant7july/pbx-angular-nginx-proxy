const Joi = require('joi');

const getViewAccessFilter = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        access_type: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        allow_ip_restriction: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        company: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        cidr: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        restriction_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const createviewAccessRestriction = Joi.object({
    filters: Joi.object({
        access_type: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        allow_ip_restriction: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        company: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        cidr: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        acl_desc: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        restriction_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        mask_bit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        role: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const updateAccessRestrictionGroup = Joi.object({
    filters: Joi.object({
        access_type: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        allow_ip_restriction: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        company: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        cidr: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        acl_desc: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        restriction_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        mask_bit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        role: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getAccessFilter = Joi.object({
    customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    filters: Joi.object({
        access_type: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        allow_ip_restriction: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        company: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        cidr: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        restriction_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

module.exports = { getViewAccessFilter, createviewAccessRestriction, updateAccessRestrictionGroup, getAccessFilter }