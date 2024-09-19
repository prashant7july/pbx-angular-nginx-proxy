const Joi = require('joi');

const filterBillingInfo = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_invoice_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_company: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true) 
}).unknown(true);

const filterBilling = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({        
        by_company: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_country: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),        
        by_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
});

const getCustomerBillingByFilters = Joi.object({
    filters: Joi.object({        
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid()).optional(),        
    }).unknown(true)
});

module.exports = { filterBillingInfo, filterBilling, getCustomerBillingByFilters }