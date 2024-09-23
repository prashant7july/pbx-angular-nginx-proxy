
export class support {

        id:string;
        name :string;
        product: string;
        created_at: string;


    constructor(
            created_at: string, 
            name: string, 
            product: string, 
            id: string
        ) {
            
            this.id = id;
            this.name=name;
            this.product= product ;
            this.created_at= created_at; 
            
        }
}