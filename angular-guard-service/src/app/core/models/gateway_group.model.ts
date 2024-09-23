export class GatewayGroup {
    created_at: string;
    name: string;
    description: string;
    gateway:string;
    status: string;
    id:string;

    constructor(created_at: string ,  name: string,
         description: string,gateway:string,status: string,
        id: string)
    {
        this.created_at =created_at;   
        this.name = name;
        this.description = description;        
        this.gateway = gateway;              
        this.status = status;         
        this.id = id;
   }
}
  