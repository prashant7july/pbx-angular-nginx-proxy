const Joi = require('joi');

const filterTrunkList = Joi.object({
    filters: Joi.object({
        by_company: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    }).unknown(true)
}).unknown(true);

const trunkById = Joi.object({
    id: Joi.number().strict().required()
}).unknown(true)

// const trunkList

const getTrunkRoutingByFilter = Joi.object({
    filters: Joi.object({
        by_feature: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        by_name: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        by_prompt: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    }).unknown(true)
}).unknown(true);

const postTrunkList = Joi.object({
    credentials: Joi.object({
        name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        max_simultaneous_calls: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        caller_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        outbound_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        authentication: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid('0')),
        inbound_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        allow_calls: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        external_uri: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        profile: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
        password: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        whitelist_ip: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        whitelist_ip2: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")),
        customer: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        cps: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        profile_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        company_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        auth_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    }).unknown(true)
}).unknown(true);

const updateTrunkList = Joi.object({
    credentials: Joi.object({
        name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        max_simultaneous_calls: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        caller_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        outbound_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        authentication: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid('0')),
        inbound_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        allow_calls: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
        external_uri: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        profile: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
        password: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        whitelist_ip: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        whitelist_ip2: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")),
        customer: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        cps: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        profile_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        company_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        auth_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null))
    }).unknown(true)
}).unknown(true);

const postTrunkRouting = Joi.object({
    filters: Joi.object({
        active_feature: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        custId: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        destination_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        enable_bypass: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        prompt_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
        trunk_name: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    }).unknown(true)
}).unknown(true);

const updateRouting = Joi.object({
    filters: Joi.object({
        active_feature: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        custId: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        destination_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        enable_bypass: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
        prompt_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
        trunk_name: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    }).unknown(true)
}).unknown(true);

const trunkListById = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))
}).unknown(true);

const generalPromptList = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))
}).unknown(true);

const trunkRoutingList = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))
}).unknown(true);

module.exports = { filterTrunkList, trunkById, updateTrunkList, postTrunkList, getTrunkRoutingByFilter, postTrunkRouting, updateRouting, trunkListById, generalPromptList, trunkRoutingList }