const Joi = require('joi');

const getPermissionUsers = Joi.object({
    id: Joi.number().strict().required()
}).unknown(true);

const updatePermission = Joi.object({
    permission: Joi.object(
        {
            permission_name:Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(),
            allCheck:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            permissions:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            complete_permissions:Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(), 
            user_type:Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(), 
            pbx:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            oc:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            permissionObj:Joi.alternatives().try(Joi.array(),Joi.valid("")).optional(), 
            permissionId:Joi.alternatives().try(Joi.number(),Joi.valid("")).optional(), 
        }
    ).unknown(true)
});

const createPermission = Joi.object({
    permission: Joi.object(
        {
            permission_name:Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(),
            allCheck:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            permissions:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            complete_permissions:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            user_type:Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(), 
            pbx:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            oc:Joi.alternatives().try(Joi.boolean(),Joi.valid("")).optional(), 
            permissionObj:Joi.alternatives().try(Joi.array(),Joi.valid("")).optional(), 
            permissionId:Joi.alternatives().try(Joi.number(),Joi.valid("")).optional(), 
        }
    ).unknown(true)
})

module.exports = { getPermissionUsers, updatePermission, createPermission }