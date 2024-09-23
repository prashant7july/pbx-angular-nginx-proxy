export class ContactGroup {
    created_at: string;
    name:string;
    description : string;
    id:string;
    customer_id: string;

    constructor(created_at: string ,   name:string, description : string,customer_id : string,
        id:string)
    {
        this.created_at =created_at;       
        this.name = name;
        this.description = description;     
        this.id = id;
        this.customer_id = customer_id
   }
}
  