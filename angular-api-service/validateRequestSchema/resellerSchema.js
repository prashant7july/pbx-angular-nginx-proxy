const Joi = require('joi');

const filterReseller = Joi.object({
    product_id: Joi.string().strict().required(),
    data: Joi.object({
        by_email: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_mobile: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_user_role: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        permission_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);

const getPermissionByUserId  = Joi.object({
    data: Joi.object({
        id: Joi.alternatives().try(Joi.number().strict()),
    }).unknown(true)
}).unknown(true);


module.exports = { filterReseller, getPermissionByUserId }