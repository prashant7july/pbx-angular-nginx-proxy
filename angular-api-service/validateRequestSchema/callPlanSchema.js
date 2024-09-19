const Joi = require('joi');

const deleteCallRateGroupSchema = Joi.object({
    id: Joi.number().strict().required()
});

const viewCallPlanSchema = Joi.object({
    id: Joi.alternatives().try(
        Joi.number().strict(),
        Joi.valid(null)
      ).optional(),
    name: Joi.alternatives().try(
        Joi.string().strict(),
        Joi.valid(null)
      ).optional()
})

const arrayOfObjectsSchema = Joi.array().items(
    Joi.object({
      fee_type: Joi.alternatives().try(Joi.number(),Joi.valid("")).optional(),
      charge: Joi.number()
    })
  ).optional()

const createCallPlan = Joi.object({
    callPlan: Joi.object({        
        base_charge: Joi.number().strict().required(),
        bundle_type: Joi.number().strict().required(),
        fee_type_charges: arrayOfObjectsSchema,
        id: Joi.alternatives().try(Joi.number().strict(),Joi.valid(null)).optional(),
        circle_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid(null)).optional(),
        validity: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),        
        isMinutePlan: Joi.boolean().strict(),
        isPlanType: Joi.number().strict().required(),
        name: Joi.string().strict().required(),
        isCircle: Joi.alternatives().try(Joi.boolean().strict(),Joi.valid("")).optional(),
        type: Joi.number().strict().required(),
        number_of_days: Joi.number().strict().required()
    }).unknown(true)
})

const filterCallPlanSchema = Joi.object({
  filters: Joi.object({
    by_name: Joi.alternatives().try(Joi.string().strict(),Joi.valid("")).optional(),
    // minute_paln_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_validity: Joi.alternatives().try(Joi.string(),Joi.valid("")).optional(),
    by_type: Joi.alternatives().try(Joi.number().strict(),Joi.valid("")).optional(),
    by_circle: Joi.array().items(Joi.alternatives().try(Joi.number().strict(),Joi.valid(""))).optional()
  }).unknown(true)
})

const extraFeeMappingSchema = Joi.object({
  id: Joi.number().strict().required()
})

const deleteCallPlanSchema = Joi.object({
  id: Joi.number().strict().required()
})

const getBoosterPlanHistoryByFilters = Joi.object({
  ResellerID: Joi.number().strict().required(),
  role: Joi.number().strict().required(),
  filters: Joi.object({
    by_charge: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    by_range: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
    by_validity: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()
  }).unknown(true)
}).unknown(true);

const viewBundleAndRoamingHistory = Joi.object({
  ResellerID: Joi.number().strict().required(),
  role: Joi.number().strict().required(),
  filters: Joi.object({
    by_plan_type: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null), Joi.valid("")).optional(),
    by_name: Joi.alternatives().try(Joi.string().strict(), Joi.valid(null),Joi.valid("")).optional(),
    by_date: Joi.alternatives().try(Joi.string().strict(), Joi.valid(null),Joi.valid("")).optional(),
    by_company: Joi.alternatives().try(Joi.array().strict(), Joi.valid(null),Joi.valid("")).optional()
  }).unknown(true)
}).unknown(true);

const associatepackage = Joi.object({
  flag : Joi.alternatives().try(Joi.string(), Joi.valid('')).optional(),
  id : Joi.alternatives().try(Joi.string(), Joi.valid('')).optional(),
}).unknown(true)

const viewCustomerBoosterPlan= Joi.object({
  customer_id : Joi.alternatives().try(Joi.number().strict()).optional(),
}).unknown(true)

const viewCustomerDidBundlePlan = Joi.object({
  by_destination : Joi.alternatives().try(Joi.array(), Joi.valid('')).optional(),
  customer_id : Joi.alternatives().try(Joi.number(), Joi.valid('')).optional(),
}).unknown(true)

const viewCustomerOutgoingBundlePlan = Joi.object({
  by_destination : Joi.alternatives().try(Joi.array(), Joi.valid('')).optional(),
  customer_id : Joi.alternatives().try(Joi.number(), Joi.valid('')).optional(),
}).unknown(true)

const viewCustomerRoamingPlan = Joi.object({
  by_destination : Joi.alternatives().try(Joi.array(), Joi.valid('')).optional(),
  customer_id : Joi.alternatives().try(Joi.number(), Joi.valid('')).optional(),
  by_group_name: Joi.alternatives().try(Joi.string(), Joi.valid('')).optional(),
}).unknown(true)



module.exports = { 
  deleteCallRateGroupSchema,
  viewCallPlanSchema,
  createCallPlan, 
  filterCallPlanSchema, 
  extraFeeMappingSchema, 
  deleteCallPlanSchema ,
  getBoosterPlanHistoryByFilters, 
  viewBundleAndRoamingHistory, 
  associatepackage,
  viewCustomerBoosterPlan,
  viewCustomerDidBundlePlan,
  viewCustomerOutgoingBundlePlan, 
  viewCustomerRoamingPlan,
 };

