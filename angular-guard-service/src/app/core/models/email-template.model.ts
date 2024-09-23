import { StringifyOptions } from 'querystring';

export class EmailTemplate {
    created_at: string;
    name:string;
    title: string;
    image: string;
    content: string;
    category_name : string;
    status: string;
    id:string;
    email_category_id:string;

    constructor(created_at: string , name: string , title: string,
          image: string, content: string,category_name : string,status: string,
        id: string,email_category_id:string)
    {
        this.created_at =created_at;       
        this.name = name;
        this.title = title;
        this.image = image;    
        this.content = content; 
        this.category_name = category_name;    
        this.status = status;         
        this.id = id;
        this.email_category_id=  email_category_id;
   }
}
  