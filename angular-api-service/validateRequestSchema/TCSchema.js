const Joi = require('joi');


const addTCPackage = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    price: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    country: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    contact: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    minutes: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    email_notification: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    sms_notification: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    by_date: Joi.alternatives().try(Joi.array(),Joi.string(), Joi.valid("")).optional(),
    total_minutes: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    customerId: Joi.number().strict(),
}).unknown(true);

const addTC = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    recording: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    welcome_prompt: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    moh: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    ring_strategy: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    periodic_announcement: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    periodic_announcement_time: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    periodic_announcement_prompt: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
    play_position_on_call: Joi.alternatives().try(Joi.boolean(),Joi.strict(), Joi.valid("")).optional(),
    play_position_periodically: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),

    is_extension: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    is_pstn: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    extension: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    pstn: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    group_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    user_ids: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    unauthorized_fail: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),

    active_feature: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    active_feature_value: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    free_time: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    exhaust_announcement: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    tc_caller_id: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
    customerId: Joi.number().strict(),
}).unknown(true);

const updateTC = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    recording: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    welcome_prompt: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    moh: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    ring_strategy: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    periodic_announcement: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    periodic_announcement_time: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    periodic_announcement_prompt: Joi.alternatives().try(Joi.number(), Joi.valid("")).optional(),
    play_position_on_call: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    play_position_periodically: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),

    is_extension: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    is_pstn: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    extension: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    pstn: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    group_id: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    user_ids: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    unauthorized_fail: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),

    active_feature: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    active_feature_value: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    free_time: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    exhaust_announcement: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    tc_caller_id: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    id: Joi.number().strict(),
    customerId: Joi.number().strict(),
}).unknown(true);

const updateTCPackage = Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    price: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    country: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    contact: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    minutes: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    email_notification: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    sms_notification: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    by_date: Joi.alternatives().try(Joi.array(),Joi.string(), Joi.valid("")).optional(),
    total_minutes: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    customerId: Joi.number().strict(),
}).unknown(true);

const viewCustomerBundlePlan = Joi.object({
    customer_id: Joi.number().strict(),
    flag: Joi.alternatives().try(
                    Joi.boolean().strict(),
                    Joi.number().strict(),
                ),
}).unknown(true);

const getTeleConsultationRecording = Joi.object({
    id: Joi.number().strict(),
    role: Joi.number().strict()
}).unknown(true);

const viewTCPackage = Joi.object({
    customer_id: Joi.number().strict(),
}).unknown(true);

const getSubscriberInfo = Joi.object({
    Id: Joi.number().strict(),
}).unknown(true);

const getTC = Joi.object({
    customer_id: Joi.string().strict(),
}).unknown(true);

const getTC_CdrByFilters = Joi.object({
    filters: Joi.object({
    by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_destination: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_callerid: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    by_terminatecause: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_tc: Joi.alternatives().try(Joi.boolean(), Joi.number(), Joi.valid("")).optional(),
    customerId: Joi.number().strict(),
    }).unknown(true)
})

const getSubscriberInfoByFilter = Joi.object({
    filters: Joi.object({
    by_destination: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    by_expiry: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    id: Joi.number().strict(),
    }).unknown(true)
})
const getCustomerBoosterPlanByFilters = Joi.object({
    filters: Joi.object({
    by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    by_validity: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
})

module.exports = {updateTC,addTC,getTC,getCustomerBoosterPlanByFilters,getSubscriberInfoByFilter,getSubscriberInfo,viewCustomerBundlePlan,getTeleConsultationRecording,addTCPackage,updateTCPackage,viewTCPackage,getTC_CdrByFilters }