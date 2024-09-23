export class Ticket {
    created_at: string;
    product:string;
    ticket_number: string;
    ticket_type: string;
    assignedTo: string;
    message: string;
    status: string;
    id:string;
    customer_id:string;
company_name:string;

    constructor(created_at: string , product: string , ticket_number: string,
        ticket_type: string,  assignedTo: string, message: string,  status: string,
        id: string,customer_id:string,company_name:string)
    {
        this.created_at =created_at;       
        this.product = product;
        this.ticket_number = ticket_number;
        this.ticket_type = ticket_type;
        this.assignedTo = assignedTo;
        this.message = message;           
        this.status = status;         
        this.id = id;
        this.customer_id = customer_id;
        this.company_name= company_name;
   }
}
  