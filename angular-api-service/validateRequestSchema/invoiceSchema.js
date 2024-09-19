const Joi = require('joi');

const filterInvoice = Joi.object({
    ResellerID: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    filters: Joi.object({
        amount: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        customer_status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        paid_status: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        reference_num: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
    }).unknown(true)
}).unknown(true);
// amount: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),

const saveAdminPaymentLog = Joi.object({
    credentials: Joi.object({
        paymentMode: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        dateRange: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        amount_with_gst: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        dd_string: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        bank_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        amount_to_pay: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        cheque_string: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        upi_string: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        payment_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        desc: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        paid: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        invoice_string: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

module.exports = { filterInvoice, saveAdminPaymentLog }