export class ContactList {
    created_at: string;
    name:string;
    email:string;
    phone_number1: string;
    phone_number2: string;
    organization: string;
    designation: string;
    customer_id: string;
    extension_id:string;
    country:string;
    status: string;
    id:string;

    constructor(created_at: string ,   name:string, email:string,phone_number1: string,
        phone_number2: string,organization: string, designation: string, customer_id: string,
        extension_id:string,country:string, status: string,
        id:string)
    {
        this.created_at =created_at;       
        this.name = name;
        this.email = email;
        this.phone_number1 = phone_number1;
        this.phone_number2 = phone_number2;
        this.organization = organization;           
        this.designation = designation;  
        this.customer_id = customer_id;  
        this.extension_id = extension_id;  
        this.country = country;  
        this.status = status;         
        this.id = id;
   }
}
  