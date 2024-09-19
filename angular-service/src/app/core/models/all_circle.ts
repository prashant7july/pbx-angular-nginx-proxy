
export class circle {

    id:string;
    name :string;
     description: string;
    created_at: string;


    constructor(created_at: string ,
        name: string,  description: string,
        id: string) {
            
            this.id = id;
            this.name=name;
            this.description= description ;
            this.created_at= created_at; 
            
        }
}