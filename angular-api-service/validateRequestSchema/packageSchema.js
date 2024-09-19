const Joi = require('joi');

const getPackageCustomers = Joi.object({
    package_id: Joi.number().strict(),
    product_id: Joi.number().strict(),
}).unknown(true);

const deletePackage = Joi.object({
    package_id: Joi.number().strict().required(),
    product_id: Joi.number().strict().required(),
}).unknown(true);

const getCustomerPackage = Joi.object({
    userId: Joi.number().strict().required(),
}).unknown(true);

module.exports = { getPackageCustomers, deletePackage ,getCustomerPackage};
