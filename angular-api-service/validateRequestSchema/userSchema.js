const Joi = require('joi');

const statusWiseUserSchema = Joi.object({
    customerStatus: Joi.number().strict().required(),
    productId: Joi.number().strict().required()
});

const inactiveCustomer = Joi.object({
    action: Joi.string().strict().required(),
    email: Joi.string().strict().required(),
    id: Joi.number().strict().required(),
    name: Joi.string().strict().required(),
}).unknown(true);

const activeCustomer = Joi.object({
    action: Joi.string().strict().required(),
    email: Joi.string().strict().required(),
    id: Joi.number().strict().required(),
    name: Joi.string().strict().required(),
}).unknown(true);

const getUserInfo = Joi.object({
    userId: Joi.number().strict().required(),
}).unknown(true);

const createUser = Joi.object({
    product_name: Joi.alternatives().try(
        Joi.string().strict().allow(''),
        Joi.array().items(Joi.string().strict().allow('')),
        Joi.valid(null)
    ).optional(),
    oc_package_name: Joi.alternatives().try(
        Joi.string().strict().allow(''),
        Joi.number().strict().allow('')
    ).optional(),
    pbx_package_name: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.number().strict().allow(''), Joi.valid(null)).optional(),
    f_name: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    l_name: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    email: Joi.alternatives().try(Joi.string().email().allow('')).optional(),
    username: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    mobile: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    company: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    company_address: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.valid(null)).optional(),
    company_phone: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.valid(null)).optional(),
    domain: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.valid(null)).optional(),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    status: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    account_manager: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    country: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    states: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    country_code: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    time_zone: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    billing_type: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    balance: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.valid(null),Joi.valid(0)).optional(),
    credit_limit: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    gst_number: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.valid(null)).optional(),
    isCircle: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    isSetDate: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    circle: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    plugin: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    enterprise_directory: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    intercom_calling: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    apiToken: Joi.alternatives().try(Joi.boolean().strict(), Joi.number().strict(), Joi.allow(null)).optional(),
    token: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    extension_length_limit: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    monthly_international_threshold: Joi.alternatives().try(Joi.number().strict(), Joi.string().strict().allow('')).optional(),
    threshold: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    invoice_day: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    advance_payment: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    callback_url: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    dialout_group: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    is_notification_email: Joi.alternatives().try(Joi.boolean().strict(), Joi.number().strict(), Joi.allow(null)).optional(),
    notification_email: Joi.alternatives().try(Joi.string().email().allow('')).optional(),
    ip: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    is_Li: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    Li: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    cli_type: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    date: Joi.alternatives().try(Joi.date(), Joi.allow(null)).optional(),
    request_hit: Joi.alternatives().try(Joi.number().strict(), Joi.allow(null)).optional(),
    is_dunning: Joi.alternatives().try(Joi.boolean().strict(), Joi.number().strict(), Joi.allow(null)).optional(),
    pan_number: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    p_i_number: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    p_o_number: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    threshold_fifty: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    threshold_seventyFive: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    threshold_ninety: Joi.alternatives().try(Joi.boolean().strict(), Joi.allow(null)).optional(),
    threshold_balance_notification: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    user_type: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    user_id: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    url: Joi.alternatives().try(Joi.string().uri().allow('')).optional()
}).unknown(true);

const getUsersByFilters = Joi.object({
    filters: Joi.object({
        by_company: Joi.alternatives().try(
            Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).allow(null),
            Joi.string().strict().allow('')
        ).optional(),
        by_email: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.number().strict()).optional(),
        by_account_manager: Joi.alternatives().try(
            Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).allow(null),
            Joi.string().strict().allow('')
        ).optional(),
        by_billing_type: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.number().strict()).optional(),
        by_product: Joi.alternatives().try(Joi.string().strict().allow(''), Joi.number().strict()).optional(),
        by_oc: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        by_pbx: Joi.alternatives().try(Joi.number().strict(), Joi.string().strict().allow('')).optional(),
        by_name: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        by_circle: Joi.alternatives().try(
            Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.string().strict())).allow(null),
            Joi.string().strict().allow('')
        ).optional(),
        by_username: Joi.alternatives().try(Joi.string().strict().allow('')).optional()
    }).unknown(true)
}).unknown(true);

const getInternalUsersByFilters = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        by_mobile: Joi.alternatives().try(Joi.number().strict()).optional(),
        by_email: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
        by_status: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        by_user_role: Joi.alternatives().try(Joi.number().strict(), Joi.string().strict()).allow(null).optional(),
        by_permission: Joi.alternatives().try(Joi.string().strict().allow('')).optional(),
    }).unknown(true)
}).unknown(true);

module.exports = { statusWiseUserSchema, getInternalUsersByFilters, inactiveCustomer, activeCustomer, getUserInfo, getUsersByFilters, createUser };
