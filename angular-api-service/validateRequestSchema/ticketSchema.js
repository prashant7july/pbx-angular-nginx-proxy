const Joi = require('joi');

const createTicketSchema = Joi.object({
    assignedPerson: Joi.number().strict(),
    assigned_to: Joi.number().strict(),
    customer_id: Joi.number().strict(),
    role: Joi.number().strict(),
    ticket_type: Joi.number().strict()
}).unknown(true);

const viewTicketSchema = Joi.object({
    ResellerID: Joi.number().strict(),
    role: Joi.number().strict()
}).unknown(true);

const filterTicketSchema = Joi.object({
    ResellerID: Joi.number().strict(),
    role: Joi.number().strict(),
    filters: Joi.object({
        by_assignee: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
        by_company: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid())).optional(),
        by_product: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")).optional(),        
        by_status: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),        
        by_ticket: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),
        by_type: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),        
    }).unknown(true)
}).unknown(true);

const ticketHistorySchema = Joi.object({
    ticketId: Joi.number().strict()
}).unknown(true);

const addTicketTypeSchema = Joi.object({
    description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    name: Joi.string().strict().required(),
    product_id: Joi.number().strict().required(),
    role: Joi.number().strict().required(),
    user_id: Joi.number().strict().required()
}).unknown(true);

const updateTicketTypeSchema = Joi.object({
    ticketData: Joi.object({
        description: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        name: Joi.string().strict().required(),
        product_id: Joi.number().strict().required(),        
    }).unknown(true)
}).unknown(true);

const filterTicketTypeList = Joi.object({
    ResellerID: Joi.number().strict().required(),
    filterObj: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    role: Joi.number().strict().required()
}).unknown(true);

const viewTicketProductandCustomerwise = Joi.object({
    productId: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    userId: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    limit_flag: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const filterCustomerWithProductTicket = Joi.object({
    filters: Joi.object({
        by_status: Joi.alternatives().try(Joi.number().strict()).allow("", null).optional(),
        by_ticket: Joi.alternatives().try(Joi.number().strict()).allow("", null).optional(),
        customerId: Joi.alternatives().try(Joi.number().strict()).allow("", null).optional()
    }).unknown(true)
}).unknown(true);


module.exports = { createTicketSchema, viewTicketSchema, filterTicketSchema, ticketHistorySchema, addTicketTypeSchema, updateTicketTypeSchema, filterTicketTypeList, viewTicketProductandCustomerwise, filterCustomerWithProductTicket }