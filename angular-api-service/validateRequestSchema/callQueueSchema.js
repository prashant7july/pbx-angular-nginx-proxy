const Joi = require('joi');

const createCallQueue = Joi.object({
    callqueue: Joi.object({        
        name: Joi.string().strict(),
        recording: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid([])
            .optional()
        ),
        welcome_prompt: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        moh: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        ring_strategy: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        periodic_announcement: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        periodic_announcement_prompt: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
        play_position_on_call: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
        feedback_call: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid([]),
            Joi.valid(null).optional()
        ),
        sticky_agent: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid([]),
            Joi.valid(null).optional()
        ),
        sticky_agent_type: Joi.alternatives().try(Joi.number().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        sms: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid([]),
            Joi.valid(null).optional()
        ),
        unauthorized_fail: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),   
        
        active_feature: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        active_feature_value: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        sticky_expire: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
        id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        agent: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        welcome_prompt_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        moh_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),   
        feedback_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),   
    }).unknown(true)
})

const getCallQueueByFilters = Joi.object({
    id: Joi.number().strict(),
    filters: Joi.object({
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        by_feedback_call: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
  
    }).unknown(true)
});
const viewCallqueue = Joi.object({
        customer_id: Joi.number().strict(),
        name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)).optional(),
}).unknown(true)
module.exports = { createCallQueue,getCallQueueByFilters,viewCallqueue}