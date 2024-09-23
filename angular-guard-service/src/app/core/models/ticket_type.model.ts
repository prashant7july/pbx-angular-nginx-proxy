export class TicketType {
    created_at: string;
    product_id:string;
    description : string
    ticket_type: string;
    id:string;
   

    constructor(created_at: string , product_id : string , ticket_type: string,
        id: string,description:string)
    {
        this.created_at = created_at;       
        this.product_id = product_id;
        this.description= description
        this.ticket_type = ticket_type;
        this.id = id;
        
   }
}
  