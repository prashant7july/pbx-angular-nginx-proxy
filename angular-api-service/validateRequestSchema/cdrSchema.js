const Joi = require('joi');

const filterAdminCdr = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        by_buycost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_callplan: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        // by_circle: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_company: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        // by_destination: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_trunck: Joi.array().items(Joi.number().strict(), Joi.valid()).optional()
    }).unknown(true)
});

const filterExtensionCdr = Joi.object({
    filters: Joi.object({
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.array().items(Joi.number().strict(), Joi.valid()).optional()
    }).unknown(true)
}).unknown(true);

const getCustomerStickyAgentByFilters = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_destination: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_callerid: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getCustomerCdrByFilters = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_destination: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_callerid: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const getFeedbackReportByFilters = Joi.object({
    filters: Joi.object({
        by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict().port(), Joi.valid("")).optional(),
        by_destination: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_callerid: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const filterConference = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string()).allow("", null).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).allow("", null).optional()
    }).unknown(true)
}).unknown(true);

const filterCustomerCdr = Joi.object({
    filters: Joi.object({
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid([])).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_destination: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).allow("").optional()
    }).unknown(true)
}).unknown(true);

const filterFeedBackReport = Joi.object({
    filters: Joi.object({
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_destination: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).allow("").optional()
    }).unknown(true)
}).unknown(true);

const filterCustomerStickyAgent = Joi.object({
    filters: Joi.object({
        by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_terminatecause: Joi.array().items(Joi.number().strict(), Joi.valid()).optional(),
        by_destination: Joi.array().items(Joi.number().strict(), Joi.valid()).optional()
    }).unknown(true)
}).unknown(true);

module.exports = {
    filterAdminCdr, filterExtensionCdr, filterCustomerCdr, filterFeedBackReport, filterCustomerStickyAgent, filterAdminCdr,
    filterExtensionCdr,
    getCustomerStickyAgentByFilters,
    getCustomerCdrByFilters,
    getFeedbackReportByFilters,
    filterConference
}
