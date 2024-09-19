const Joi = require('joi');

// const createConference = Joi.object({
//     conference: Joi.object({
//         name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
//         admin_pin: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
//         conf_ext: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
//         conf_join_end_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
//         conf_join_start_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
//         customer_id: Joi.number().strict(),
//         email: Joi.alternatives().try(
//             Joi.array().strict(),
//             Joi.string().strict(),
//             Joi.valid(""),
//             Joi.valid([]).optional()
//         ),
    
//         end_conf: Joi.alternatives().try(
//             Joi.boolean().strict(),
//             Joi.number().strict(),
//             Joi.valid(""),
//             Joi.valid([]).optional()
//         ),
//         id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""),Joi.valid(null)).optional(),
//         moh: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
   
//         name_record: Joi.alternatives().try(
//             Joi.boolean().strict(),
//             Joi.number().strict(),
//             Joi.valid(""),
//             Joi.valid([]).optional()
//         ),
//         participant: Joi.alternatives().try(Joi.array().strict(), Joi.valid(""),Joi.valid(null)).optional(),
//         participant_pin: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
     
//         recording: Joi.alternatives().try(
//             Joi.boolean().strict(),
//             Joi.number().strict(),
//             Joi.valid(""),
//             Joi.valid([]).optional()
//         ),
     
//         wait_moderator: Joi.alternatives().try(
//             Joi.boolean().strict(),
//             Joi.number().strict(),
//             Joi.valid(""),
//             Joi.valid([]).optional()
//         ),
//         welcome_prompt: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()        
//     }).unknown(true),
// }).unknown(true);


const filterConference = Joi.object({
    credentials: Joi.object({
        admin_pin: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        conf_ext: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        participant_pin: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()        
    }).unknown(true),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional()
}).unknown(true);

const createConference = Joi.object({
    conference: Joi.object({        
        admin_pin: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        conf_ext: Joi.alternatives().try(Joi.number().strict()).allow("").optional(),
        customer_id: Joi.alternatives().try(Joi.number().strict()).optional(),
        moh: Joi.alternatives().try(Joi.number().strict()).allow(0).optional(),
        name: Joi.alternatives().try(Joi.string().strict()).optional(),
        participant: Joi.array().items(Joi.number().strict()),
        participant_pin: Joi.alternatives().try(Joi.number().strict()).optional(),
        recording: Joi.alternatives().try(Joi.boolean(), Joi.number()).optional(),
        wait_moderator: Joi.alternatives().try(Joi.boolean(), Joi.number()).optional(),
        welcome_prompt: Joi.alternatives().try(Joi.number().strict()).optional(),
        end_conf: Joi.alternatives().try(Joi.boolean(), Joi.number()).optional()
    }).unknown(true)
}).unknown(true);

const viewConference = Joi.object({
    customer_id: Joi.alternatives().try(Joi.number().strict()).allow("").optional()
}).unknown(true);

module.exports = { filterConference, createConference, viewConference }
