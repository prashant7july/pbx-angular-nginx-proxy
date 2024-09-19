const Joi = require('joi');

const saveIntercomDialout = Joi.object({
    intercomList: Joi.object({        
        name: Joi.string().strict().required(),
        group_type: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        only_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        cc_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        group_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        extension_cc_list: Joi.alternatives().try(Joi.array().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        extension_group_list: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
        ext_names: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        cg_names: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        customer_id: Joi.number().strict(),
        extension_list: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
    }).unknown(true)
})
const updateIntercomDialout = Joi.object({
    intercomList: Joi.object({        
        name: Joi.string().strict(),
        group_type: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        only_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        cc_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        group_extension: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        extension_cc_list: Joi.alternatives().try(Joi.array().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        extension_group_list: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
        ext_names: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        cg_names: Joi.alternatives().try(Joi.array().strict(),Joi.valid(''),Joi.valid(null)).optional(),
        customer_id: Joi.number().strict(),
        dialout_id: Joi.number().strict(),
        extension_list: Joi.alternatives().try(Joi.string().strict(),Joi.valid(''),Joi.valid(null)).optional(),        
    }).unknown(true)
})
const getInternalDialoutByFilter = Joi.object({
    credentials: Joi.object({        
        name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        sip_allow: Joi.alternatives().try(Joi.number().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        cg_allow: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        customer_id: Joi.number().strict(),
    }).unknown(true)
})
const deleteIntercomRule = Joi.object({
    id: Joi.number().strict()
}); 
const getAssociatedExtensions = Joi.object({
    id: Joi.number().strict()
}); 
module.exports = { saveIntercomDialout,updateIntercomDialout,getInternalDialoutByFilter,deleteIntercomRule,getAssociatedExtensions}