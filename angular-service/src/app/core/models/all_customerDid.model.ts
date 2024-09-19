export class AllCustomerDID {
    
    did: string;
    country: string;
    provider: string;    
    max_concurrent: string;
    did_type: string;
    active_feature: string;
    reserved: string;
    id: string;
    activated: string;
    fixrate: string;
    company_name: string;

    constructor(did: string,country: string, 
        provider: string, max_concurrent: string, did_type: string, active_feature: string, reserved: string, id: string, activated: string, fixrate: string, company_name: string)
        {           
            this.did = did;       
            this.country = country;
            this.provider = provider;
            this.max_concurrent = max_concurrent;
            this.did_type = did_type;
            this.active_feature = active_feature;
            this.reserved = reserved;
            this.id = id;
            this.activated = activated;
            this.fixrate = fixrate;
            this.company_name = company_name;
    }
}