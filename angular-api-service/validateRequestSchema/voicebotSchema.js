const Joi = require('joi');

const getVoicebotListByFilter = Joi.object({
  credentials: Joi.object({
    customer_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    media_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    sample_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
  }).unknown(true)
}).unknown(true);

const updateVoicebotData = Joi.object({
  credentials: Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    websocket_url: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    sample_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    playback: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
    media_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    cust_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    id: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null))
  }).unknown(true)
}).unknown(true);

const createVoicebot = Joi.object({
  credentials: Joi.object({
    name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    websocket_url: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    sample_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""), Joi.valid(null)),
    playback: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)),
    media_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    cust_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
  }).unknown(true)
}).unknown(true);

const getVoicebotCDRByFilter = Joi.object({
  credentials: Joi.object({
    user_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    by_call_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")),
    by_callerid: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    by_date: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")),
    by_destination: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")),
    by_terminatecause: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")),
    by_dest: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    by_sellcost: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
    by_src: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")),
  }).unknown(true)
}).unknown(true);

module.exports = { getVoicebotListByFilter, updateVoicebotData, createVoicebot, getVoicebotCDRByFilter }
