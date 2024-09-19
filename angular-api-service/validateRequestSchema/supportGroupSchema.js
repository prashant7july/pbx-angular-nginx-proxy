const Joi = require('joi');

const supportListSchema = Joi.object({
    name: Joi.string().strict().required()
});

const addSupportGroupSchema = Joi.object({
    name: Joi.string().strict().required(),
    product_id: Joi.number().strict().required()
})

const updateSupportGroupSchema = Joi.object({
    supportData: Joi.object({
        id: Joi.number().strict().required(),
        name: Joi.string().strict().required(),
        product_id: Joi.number().strict().required()
    })
})

const addAssignGroupSchema = Joi.object({
    contacts:  Joi.array().items(Joi.number().strict()).required(),
    group_id: Joi.number().strict().required()
})

const deleteSupportGroupSchema = Joi.object({
    supportData: Joi.object({
        id: Joi.number().strict().required()        
    })
})

module.exports = { supportListSchema, addSupportGroupSchema, updateSupportGroupSchema, addAssignGroupSchema, deleteSupportGroupSchema };
