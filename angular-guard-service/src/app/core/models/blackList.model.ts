export class BlackList {
    created_at: string;
    country:string;
    phone_number: string;
    name:string;
    customer_id: string;
    extension_id:string;
    status: string;
    id:string;

    constructor(created_at: string,country:string, phone_number: string ,   name:string,customer_id: string,
        extension_id:string, status: string,
        id:string)
    {
        this.created_at =created_at; 
        this.country = country;   
        this.phone_number = phone_number;     
        this.name = name;
        this.customer_id = customer_id;  
        this.extension_id = extension_id; 
        this.status = status;         
        this.id = id;
   }
}
  