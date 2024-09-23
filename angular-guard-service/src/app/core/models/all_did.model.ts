export class AllDID {
    
    did: string;
    country: string;
    provider: string;    
    max_concurrent: string;
    did_type: string;
    company: string;
    reserved: string;
    status: string;
    id: string;
    customer_id: string;
    fixrate: string;

    constructor(did: string,country: string, 
        provider: string, max_concurrent: string, did_type: string, company: string, reserved: string, 
        status: string, id: string, customer_id: string, fixrate: string)
        {           
            this.did = did;       
            this.country = country;
            this.provider = provider;
            this.max_concurrent = max_concurrent;
            this.did_type = did_type;
            this.company = company;
            this.reserved = reserved;
            this.status = status;
            this.id = id;
            this.customer_id = customer_id;
            this.fixrate= fixrate;
    }
}