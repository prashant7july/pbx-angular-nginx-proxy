const Joi = require('joi');

const createContact = Joi.object({
    contactList: Joi.object({        
        name: Joi.string().strict().required(),
        email: Joi.string().email().required(),
        phone1: Joi.number().strict(),
        phone2: Joi.number().strict(),
        organization: Joi.alternatives().try(Joi.string().strict(),Joi.valid(""),Joi.valid(null)).optional(),
        designation: Joi.string().strict(),        
        country: Joi.number().strict(),

        country_code: Joi.string().strict(),
        role: Joi.number().strict(),
        customer_id: Joi.number().strict(),
        extension_id: Joi.number().strict(),        
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
        country_name: Joi.string().strict()
    }).unknown(true)
})
const getContactListByFilters = Joi.object({
    id: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({        
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        // by_email: Joi.alternatives().try(Joi.string().email(), Joi.valid(""), Joi.valid(null)),
        by_email: Joi.string().allow('', null).strict(),
        by_number: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    }).unknown(true) 
})

const createContactGroup = Joi.object({
    contactGroup: Joi.object({        
        name: Joi.string().strict().required(),
        description: Joi.string().strict(),
        customer_id: Joi.number().strict(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    }).unknown(true)
})
const updateContactGroup = Joi.object({
    contactGroup: Joi.object({        
        name: Joi.string().strict().required(),
        description: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null)),
        customer_id: Joi.number().strict(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    }).unknown(true)
})
const checkNumberExistInBlackList = Joi.object({
        role: Joi.number().strict(),
        customer_id: Joi.number().strict(),
        extension_id: Joi.number().strict(),        
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    // })
}).unknown(true)
const viewContactList = Joi.object({
    // role: Joi.string().strict(),
    role: Joi.alternatives().try(
        Joi.string().strict(),
        Joi.number().strict(),
        Joi.valid(""),
        Joi.valid([]),
        Joi.valid(null).optional()
    ),
    // customer_id: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")),
    customer_id: Joi.alternatives().try(
        Joi.string().strict(),
        Joi.number().strict(),
        Joi.valid(""),
        Joi.valid([]),
        Joi.valid(null).optional()
    ),
    extension_id: Joi.number().strict(),        
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
// })
}).unknown(true)

    const deleteContact = Joi.object({
    id: Joi.number().strict()
}); 
const deleteContactGroup = Joi.object({
    id: Joi.number().strict()
})

const getContactGroupByFilters = Joi.object({
    filters: Joi.object({ 
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(""), Joi.valid(null))
    })
})



module.exports = { createContact,deleteContact,viewContactList,getContactListByFilters,checkNumberExistInBlackList,createContactGroup,updateContactGroup,deleteContactGroup,getContactGroupByFilters}