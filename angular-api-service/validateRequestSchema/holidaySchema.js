const Joi = require('joi');

const createHoliday = Joi.object({
    holiday: Joi.object({        
        holiday: Joi.string().strict().required(),
        date: Joi.string().strict().required(),
        start_time: Joi.string().strict(),
        end_time: Joi.string().strict(),
        fullDay: Joi.alternatives().try(Joi.number().strict(),Joi.valid(null)).optional(),
        customer_id: Joi.number().strict().required(),        
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null))
    }).unknown(true)
})
const deleteHoliday = Joi.object({
    id: Joi.number().strict()
}); 

const getHolidayFilters = Joi.object({
    filters: Joi.object({    
        by_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid('')).optional(),
        by_range: Joi.alternatives().try(Joi.array().strict(),Joi.valid('')).optional(),    
        customer_id: Joi.number().strict().required(),   
        role: Joi.number().strict().required() 
    }).unknown(true)
}).unknown(true);
const viewHoliday = Joi.object({
    customer_id: Joi.number().strict(),
    role: Joi.number().strict()
}).unknown(true);

module.exports = { createHoliday,deleteHoliday,getHolidayFilters,viewHoliday }