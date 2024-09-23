export class EmailCategory {
    created_at: string;
    category_name: string;
    product: string;
    status: string;
    id: string;

    constructor(created_at: string,category_name:string,product:string,
         status: string,id:string)
    {
        this.created_at =created_at; 
        this.category_name = category_name;   
        this.product = product;
        this.status = status;         
        this.id = id;
   }
}
