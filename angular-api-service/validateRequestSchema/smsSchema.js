const Joi = require('joi');

const updateSMSApi = Joi.object({
    apiDetail: Joi.object(
        {
            url: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            provider: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            parameterForm: Joi.alternatives().try(Joi.array(), Joi.valid("")).optional(),
            id: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            customer_id: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
        }
    ).unknown(true)
});

const createSMSApi = Joi.object({
    apiDetail: Joi.object(
        {
            url: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            provider: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            parameterForm: Joi.alternatives().try(Joi.array(), Joi.valid("")).optional(),
            customer_id: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
        }
    ).unknown(true)
});

const updateSMSPlan = Joi.object({
    smsDetail: Joi.object(
        {
            charge: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            description: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            name: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            provider: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            id: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            validity: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
        }
    ).unknown(true)
});

const createSMSPlan = Joi.object({
    smsDetail: Joi.object(
        {
            charge: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            description: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            name: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
            provider: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
            validity: Joi.alternatives().try(Joi.string(), Joi.valid("")).optional(),
        }
    ).unknown(true)
});

const createSMSPlanByFilters = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_provider: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))).optional()
    }).unknown(true)
});

const minuteAssociatePackage = Joi.object({
    id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    type: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)).optional()
});

const getAdminSMSReportByFilters = Joi.object({
    filters: Joi.object({
        by_company: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_smsplan: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_smscategory: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_smsvalidity: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
});

const viewSMSTemplateByFilters = Joi.object({
    filters: Joi.object({
        by_category: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
});

const updateSMSTemplate = Joi.object({
    smsDetail: Joi.object({
        category: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).required()
    }).unknown(true)
});

const createSMSTemplate = Joi.object({
    smsDetail: Joi.object({
        category: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        category_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const updateSMSTemplateStatus = Joi.object({
    category_id: Joi.alternatives().try(Joi.number().strict()).required(),
    status: Joi.alternatives().try(Joi.number().strict()).required(),
    id: Joi.alternatives().try(Joi.number().strict()).required()
}).unknown(true);

const CreateSMSService = Joi.object({
    service: Joi.object({
        isCheckAllConfig: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        smsConfigForm: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getCustomerSMSReportByFilters = Joi.object({
    filters: Joi.object({
        by_company: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_smsplan: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_smscategory: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_smsvalidity: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true),
});

module.exports = {
    updateSMSApi,
    createSMSApi,
    updateSMSPlan,
    createSMSPlan,
    createSMSPlanByFilters,
    minuteAssociatePackage,
    getAdminSMSReportByFilters,
    viewSMSTemplateByFilters,
    updateSMSTemplate,
    createSMSTemplate,
    updateSMSTemplateStatus,
    CreateSMSService,
    getCustomerSMSReportByFilters
}