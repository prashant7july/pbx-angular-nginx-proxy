const Joi = require('joi');

const mappedDIDByFiltersSchema = Joi.object({
    filters: Joi.object({
        by_company: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))).optional(),
        by_country: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))).optional(),
        by_did: Joi.alternatives().try(Joi.number().strict(), Joi.valid(""))
    }).unknown(true)
})

const createDIDSchema = Joi.object({
    did: Joi.object({
        billing: Joi.number().strict().required(),
        concurrent_call: Joi.number().strict().required(),
        connect_charge: Joi.number().strict().required(),
        country: Joi.number().strict().required(),
        didType: Joi.number().strict().required(),
        fixrate: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        group: Joi.number().strict().required(),
        is_did_range: Joi.boolean().strict().required(),
        // selling_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid(null)).optional(),
        provider: Joi.number().strict().required(),
        number: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        vmn: Joi.alternatives().try(Joi.number().strict()).optional()
    }).unknown(true)
})

const updateDID = Joi.object({
    did: Joi.object({
        didType: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        did_number: Joi.alternatives().try(
            Joi.string().strict(),
            Joi.array().items(Joi.number()).single(),
            Joi.valid(""),
        ).optional(),
        billing: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        provider: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        country: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        concurrent_call: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        activated: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)).optional(),
        connect_charge: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        group: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        vmn: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        is_did_range: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        vmn: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        selling_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        fixrate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true)

const createDID = Joi.object({
    did: Joi.object({
        didType: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        did_number: Joi.alternatives().try(
            Joi.string().strict(),
            Joi.array().items(Joi.number()).single(),
            Joi.valid(""),
        ).optional(),
        billing: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        provider: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        country: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        concurrent_call: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        activated: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid(""), Joi.valid(0), Joi.valid(1)).optional(),
        connect_charge: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        group: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        is_did_range: Joi.alternatives().try(Joi.boolean().strict(), Joi.valid("")).optional(),
        vmn: Joi.alternatives().try(Joi.number().strict().allow('')).optional(),
        id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        selling_rate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        fixrate: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
    }).unknown(true)
}).unknown(true);

const DIDByFilterSchema = Joi.object({
    filters: Joi.object({
        by_company: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.valid())).optional(),
        by_country: Joi.array().items(Joi.alternatives().try(Joi.number().strict(), Joi.valid())).optional(),
        by_did: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_did_type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_group: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        by_provider: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        by_status: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
    }).unknown(true)
});

const inactiveDIDSchema = Joi.object({
    did_id: Joi.number().strict().required()
});

const activeDIDSchema = Joi.object({
    did_id: Joi.number().strict().required()
});

const releaseDIDSchema = Joi.object({
    did_country: Joi.string().strict().required(),
    did_id: Joi.number().strict().required(),
    did_number: Joi.number().strict().required(),
    fixrate: Joi.number().strict().required(),
    product_id: Joi.number().strict().required(),
    user_id: Joi.number().strict().required()
}).unknown(true);

const createVMNSchema = Joi.object({
    vmn_number: Joi.number().strict().required()
}).unknown(true);

const filterVMNSchema = Joi.object({
    vmn: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).required()
});

const deleteVMNSchema = Joi.object({
    id: Joi.number().strict().required()
});

const DIDByCountrySchema = Joi.object({
    country_id: Joi.number().strict().required()
}).unknown(true);

const productWiseCustomerSchema = Joi.object({
    check_vmn: Joi.number().strict().required()
}).unknown(true)

// Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()

const assignDID = Joi.object({
    credentials: Joi.object({
        adminEmail: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        did_number: Joi.alternatives().try(Joi.array().strict(), Joi.valid("")).optional(),
        customer: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        country: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        product_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        c_id: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        url: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        customerEmail: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional(),
        charge: Joi.alternatives().try(Joi.number().strict(), Joi.valid("")).optional(),
        type: Joi.alternatives().try(Joi.string().strict(), Joi.valid("")).optional()

    }).unknown(true)
})

const deleteDID = Joi.object({
    did_id: Joi.number().strict().required()
}).unknown(true)

const getAssociateDID = Joi.object({
    id: Joi.number().strict().required()
}).unknown(true)

const createDestination = Joi.object({
    credentials: Joi.object({
        active_feature: Joi.number().required(),
        destination_id: Joi.number().integer().allow('').required(),
        time_group_id: Joi.number().integer().allow('').required(),
        url_dynamic_ivr: Joi.string().allow('').required(),
        voicebot: Joi.number().allow('').required(),
        user_id: Joi.number().required(),
        did_id: Joi.number().integer().required(),
        destination: Joi.string().required(),
        product_id: Joi.number().required(),
        name: Joi.string().required().optional()
    }).required()
});

const getCustomerDIDByFilters = Joi.object({
    filters: Joi.object({
        by_did: Joi.number().integer().required(),
        by_country: Joi.array().items(Joi.number().integer()).required(),
        by_status: Joi.number().integer().required(),
        by_did_type: Joi.number().integer().required(),
        by_group: Joi.number().integer().required()
    }).required(),
    user_id: Joi.number().integer().required()
});

const activeCustomerDID = Joi.object({
    did_id: Joi.number().integer().required(),
});


const inactiveCustomerDID = Joi.object({
    did_id: Joi.number().integer().required(),
});

const makeMasterDID = Joi.object({
    data: Joi.object({
        did: Joi.number().integer().required(),
        customer_id: Joi.number().integer().required(),
    }),
    master_id: Joi.string().required()
});

module.exports = {
    getCustomerDIDByFilters,
    makeMasterDID,
    inactiveCustomerDID,
    activeCustomerDID,
    mappedDIDByFiltersSchema,
    createDIDSchema,
    DIDByFilterSchema,
    inactiveDIDSchema,
    activeDIDSchema,
    releaseDIDSchema,
    createVMNSchema,
    filterVMNSchema,
    deleteVMNSchema,
    DIDByCountrySchema,
    productWiseCustomerSchema,
    assignDID,
    updateDID,
    createDID,
    createDestination,
    deleteDID,
    getAssociateDID,
    getCustomerDIDByFilters
}