const Joi = require('joi');

const viewServerSchema = Joi.object({
    ip: Joi.alternatives().try(Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }), Joi.valid("null")).optional(),
    port: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid(null)).optional()
}).unknown(true)

const createServerSchema = Joi.object({
    serverDetail: Joi.object({
        ip: Joi.alternatives().try(Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' })).required(),
        port: Joi.number().strict().port().required(),
        pswd: Joi.string().strict().optional(),
        service: Joi.number().strict().required(),
        status: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")),
        user: Joi.alternatives().try(Joi.string().strict()).optional()
    }).unknown(true)
});

const updateServerStatusSchema = Joi.object({
    status: Joi.number().strict().required()
}).unknown(true);

const filterServerDetailSchema = Joi.object({
    filters: Joi.object({
        by_ip: Joi.alternatives().try(Joi.string().ip({ version: ['ipv4', 'ipv6'], cidr: 'optional' }), Joi.valid("")).optional(),
        by_service: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_username: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
})
module.exports = { viewServerSchema, createServerSchema, updateServerStatusSchema, filterServerDetailSchema }