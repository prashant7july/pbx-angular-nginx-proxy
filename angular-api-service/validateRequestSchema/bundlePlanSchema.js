const Joi = require('joi');

const viewCustomerByType = Joi.object({
    booster_Type: Joi.number().strict().required()
})

const purchaseBoosterPlanSchema = Joi.object({
    adminEmail: Joi.string().email().strict().required(),
    charge_status: Joi.number().strict().required(),
    customer_id: Joi.number().strict().required(),
    process_by: Joi.number().strict().required(),
    role_id: Joi.number().strict().required(),
    purchase_date: Joi.date().required(),
    booster_for: Joi.number().strict().required()
}).unknown(true);

const filterBundlePlan = Joi.object({
    filters: Joi.object({
        by_plan_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional()
    }).unknown(true)
}).unknown(true);

module.exports = { viewCustomerByType, purchaseBoosterPlanSchema, filterBundlePlan }