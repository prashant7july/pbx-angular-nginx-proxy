const Joi = require('joi');

const viewAddBalanceSchema = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required()
}).unknown(true);

const filterAddBalance = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_paymentType: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_company: Joi.array().items(Joi.number().strict(), Joi.valid()).optional()
    }).unknown(true)
}).unknown(true);

const createAddBalance = Joi.object({
    payment_date:  Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    old_amount: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    amount: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    description:Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    agent_commission: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    payment_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    company_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    id: Joi.alternatives().try(Joi.string().strict(), Joi.valid(null)).optional(),
    commission: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    created_by: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    product: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
}).unknown(true);


module.exports = { viewAddBalanceSchema, filterAddBalance, createAddBalance }