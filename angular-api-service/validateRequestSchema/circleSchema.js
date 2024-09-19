const Joi = require('joi');

const getCircleSchema = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
})

const getDialoutRuleSchema = Joi.object({
    dialout_group: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true)

const createDialoutRuleSchema = Joi.object({
    blacklist_manipulation: Joi.number().strict().required(),
    dialout_group_id: Joi.number().strict().required(),
    dialout_manipulation: Joi.number().strict().required(),
    prepend_digit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    rule_pattern: Joi.number().strict().required(),
    strip_digit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    is_random: Joi.alternatives().try(Joi.boolean().strict()).optional(),
    caller_id_pstn: Joi.alternatives().try(Joi.number().strict()).optional(),
    exceptional_rule: Joi.array().items(Joi.alternatives().try(Joi.number().strict())).optional()
}).unknown(true);

const getDialoutGroupSchema = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
});

const addDialoutGroupSchema = Joi.object({
    description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    name: Joi.string().strict().required(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const viewWhiteListIpSchema = Joi.object({
    by_ip: Joi.alternatives().try(Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }), Joi.valid("")).optional(),
    by_status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const createWhiteListIpSchema = Joi.object({
    ipDetail: Joi.object({
        description: Joi.string().strict().required(),
        ip: Joi.alternatives().try(Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' })).required(),
        status: Joi.boolean().strict().required()
    }).unknown(true)
});

const smtpListByFilters = Joi.object({
    filters: Joi.object({
        host: Joi.alternatives().try(Joi.string().strict().hostname(), Joi.valid("")).optional(),
        name: Joi.alternatives().try(Joi.string().strict().valid("")).optional(),
        port: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    })
})

const addSmtpSchema = Joi.object({
    host: Joi.alternatives().try(Joi.string().strict().hostname()),
    name: Joi.string().strict().required(),
    password: Joi.string().required(),
    port: Joi.number().strict().port().required(),
    status: Joi.alternatives(Joi.boolean().strict(), Joi.valid("")),
    username: Joi.string().strict().required()
}).unknown(true)

module.exports = { 
    getCircleSchema, 
    getDialoutRuleSchema, 
    createDialoutRuleSchema, 
    getDialoutGroupSchema, 
    addDialoutGroupSchema, 
    viewWhiteListIpSchema, 
    createWhiteListIpSchema, 
    smtpListByFilters, 
    addSmtpSchema,
}
