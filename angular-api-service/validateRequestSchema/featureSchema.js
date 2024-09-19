const Joi = require('joi');

const blackListFeatures = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    product_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    role: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const createPackage = Joi.object({
    feature: Joi.object({
        appointment: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        billing_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        broadcast: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        bundle_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid('')).optional(),
        call_barging: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        call_group: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        call_plan: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        call_transfer: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        caller_id: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        check_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        check_outgoing: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        check_roaming: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        check_tc: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        circle: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        concurrent_call: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        conference: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        cps: Joi.alternatives().try(Joi.number().strict(), Joi.valid('')).optional(),
        custom_acl: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        custom_prompts: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        dynamic_ivr: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        extension_limit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        featureRate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        feedback_call: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        file_storage_duration: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        file_storage_size: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        find_me_follow_me: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        forward: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        gateway_group: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        geo_tracking: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        isCircle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid('')).optional(),
        isFeatureRate: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        isSMSTypCustom: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        isSms: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        is_auto_renewal: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        is_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        is_minute_plan: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        is_roaming: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        ivr: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        minute_balance: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        miss_call_alert: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        music_on_hold: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        out_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        out_bundle_call_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        outbound: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        outbound_broadcast: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        outbound_conference: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        package_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        paging: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        pbx_recording: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        phone_book: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        playback: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        queue: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        ring_time_out: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        roaming_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        sip_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        speed_dial: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        sticky_agent: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        storage: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        subscription: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        teleConsultancy: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        teleConsultancy_call_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        vm_limit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        voice_mail: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        whatsapp: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        voicebot: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional()
    }).unknown(true)
}).unknown(true);

const getFeatureCodeByFilters = Joi.object({
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const viewFeaturePlan = Joi.object({
    plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
}).unknown(true);

const viewGlobalRateMapping = Joi.object({
    featurePlanRateId: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
}).unknown(true);

const updatePackage = Joi.object({
    feature: Joi.object({
        appointment: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        billing_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        broadcast: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        bundle_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid('')).optional(),
        call_barging: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        call_group: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        call_plan: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        call_transfer: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        caller_id: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        check_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        check_outgoing: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        check_roaming: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        check_tc: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        circle: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        concurrent_call: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        conference: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        cps: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        custom_acl: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        custom_prompts: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        dynamic_ivr: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        extension_limit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        featureRate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        feedback_call: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        file_storage_duration: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        file_storage_size: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        find_me_follow_me: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        forward: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        gateway_group: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        geo_tracking: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        isCircle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid('')).optional(),
        isFeatureRate: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        isSMSTypCustom: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        isSms: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        is_auto_renewal: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        is_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        is_minute_plan: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        is_roaming: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        ivr: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        minute_balance: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        miss_call_alert: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        music_on_hold: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        out_bundle: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        out_bundle_call_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        outbound: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        outbound_broadcast: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        outbound_conference: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        package_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        paging: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        pbx_recording: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        phone_book: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        playback: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        queue: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        ring_time_out: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        roaming_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        sip_trunk: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        speed_dial: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        sticky_agent: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        storage: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        subscription: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        teleConsultancy: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        teleConsultancy_call_plan_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        vm_limit: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        voice_mail: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        whatsapp: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional(),
        voicebot: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(false)).optional()
    }).unknown(true)
}).unknown(true);

const getPbxFeatures = Joi.object({
    customerId: Joi.alternatives().try(Joi.number().strict()).optional(),
    productId: Joi.alternatives().try(Joi.number().strict(),).optional(),
}).unknown(true)

const viewCustomerBundlePlan = Joi.object({
    customerId: Joi.alternatives().try(Joi.number().strict()).optional(),
    flag: Joi.alternatives().try(Joi.boolean().strict()).optional(),
    by_destination : Joi.alternatives().try(Joi.array().strict(),).optional(),
}).unknown(true)

const viewCustomerBoosterPlan = Joi.object({
    customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
}).unknown(true)

const viewCustomerCallPlanRate = Joi.object({
    id: Joi.alternatives().try(Joi.number().strict()).optional(),
}).unknown(true)

module.exports = {
    blackListFeatures,
    getFeatureCodeByFilters,
    viewFeaturePlan,
    viewGlobalRateMapping,
    createPackage,
    updatePackage,
    getPbxFeatures,
    viewCustomerBundlePlan,
    viewCustomerBoosterPlan,
    viewCustomerCallPlanRate
}
