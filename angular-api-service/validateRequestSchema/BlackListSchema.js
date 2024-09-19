const Joi = require('joi');

const createBlackListContact = Joi.object({
    blackList: Joi.object({        
        name: Joi.string().strict(),
        phone: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""),Joi.valid(null)).optional(),
        country: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        country_code: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        numberFormat: Joi.alternatives().try(
            Joi.boolean().strict(),
            Joi.number().strict(),
            Joi.valid(""),
            Joi.valid([]),
            Joi.valid(null).optional()
        ),
        status: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        role: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""), Joi.valid(""), Joi.valid(null)),
        customer_id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),  
        blockFor: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),  

        extension_id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        country_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
         
    }).unknown(true)
})
const viewBlackList = Joi.object({
        id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        phonenumber: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""),Joi.valid(null)).optional(),
        country: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        role: Joi.number().strict(),
        customer_id: Joi.number().strict(),  
        extension_id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
         
    }).unknown(true)
    const getBlackListByFilters = Joi.object({
        role: Joi.number().strict(),
        id: Joi.number().strict() ,
        filters: Joi.object({        
            by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""),Joi.valid(null)).optional(),
            by_number: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""),Joi.valid(null)).optional(),
            // by_country: Joi.alternatives().try(Joi.array().strict(),Joi.valid(""),Joi.valid([]),Joi.valid(null)).optional(),
            by_country: Joi.alternatives().try(
                Joi.array().strict(),
                Joi.number().strict(),
                Joi.valid(""),
                Joi.valid([]),
                Joi.valid(null).optional()
            ),
            // by_status: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
            by_status: Joi.alternatives().try(
                // Joi.string().strict(),
                Joi.number().strict(),
                Joi.valid(""),
                Joi.valid([]),
                Joi.valid(null).optional()
            ),
        }).unknown(true)
    })

const updateBlackListContactStatus = Joi.object({
        id: Joi.number().strict()
    }).unknown(true)


// const getHolidayFilters = Joi.object({
//     filters: Joi.object({    
//         by_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid('')).optional(),
//         by_range: Joi.alternatives().try(Joi.array().strict(),Joi.valid('')).optional(),    
//         customer_id: Joi.number().strict().required(),   
//         role: Joi.number().strict().required() 
//     }).unknown(true)
// }).unknown(true);
// const viewHoliday = Joi.object({
//     customer_id: Joi.number().strict(),
//     role: Joi.number().strict()
// }).unknown(true);

module.exports = { createBlackListContact,updateBlackListContactStatus,viewBlackList,getBlackListByFilters }