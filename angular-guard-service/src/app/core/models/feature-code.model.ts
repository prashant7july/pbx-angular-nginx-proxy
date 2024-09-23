export class FeatureCode {
    created_at: string;
    code:string;
    name: string;
    type: string;
    description: string;
    status: string;
    id:string;

    constructor(created_at: string , code: string , name: string,
        type: string,  description: string, status: string,
        id: string)
    {
        this.created_at =created_at;       
        this.code = code;
        this.name = name;
        this.type = type;
        this.description = description;       
        this.status = status;         
        this.id = id;
   }
}
  