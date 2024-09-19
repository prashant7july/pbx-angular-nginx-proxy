const Joi = require('joi');

const uniqueGatewayPrefixSchema = Joi.object({
    area_code : Joi.number().strict().required(),
    buying_rate: Joi.number().strict().required(),
    call_plan: Joi.number().strict().required(),    
    phonecode: Joi.number().strict().required(),    
    selling_billing_block: Joi.number().strict().required(),
    selling_min_duration: Joi.number().strict().required(),
    selling_rate: Joi.number().strict().required()
}).unknown(true);

const createCallPlanSchema = Joi.object({
    callPlanRate : Joi.object({
        area_code: Joi.number().strict().required(),
        buying_rate: Joi.number().strict().required(),
        call_plan: Joi.number().strict().required(),
        gateway: Joi.number().strict().required(),
        phonecode: Joi.number().strict().required(),
        selling_billing_block: Joi.number().strict().required(),
        selling_rate: Joi.number().strict().required(),
        selling_min_duration: Joi.number().strict().required()
    }).unknown(true)
})

const callPlanRateByFilterSchema = Joi.object({
    filters: Joi.object({
        by_call_group: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
        by_call_plan: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
        by_dial_prefix: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")).optional(),
        by_gateway: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
        by_plan_type: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")).optional(),
        by_destination: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
      }).unknown(true)
});

const viewExtensionCallPlanRate = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const userDetailCallPlanRate = Joi.object({
    role: Joi.alternatives().try(Joi.number().strict()).optional(),
    user_id: Joi.alternatives().try(Joi.number().strict())
}).unknown(true);

const filterExtensionCallPlanRate = Joi.object({
    filters: Joi.object({
        by_dial_prefix: Joi.alternatives().try(Joi.array().items(Joi.number().strict(), Joi.valid())),
        by_selling_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { uniqueGatewayPrefixSchema, createCallPlanSchema, callPlanRateByFilterSchema, viewExtensionCallPlanRate, userDetailCallPlanRate, filterExtensionCallPlanRate };
