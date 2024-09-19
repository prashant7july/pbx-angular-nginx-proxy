export class PromptDetail {
    prompt_name: string;
    prompt_type: string;     
    file_path: string;
    id: string;   
    customer_id: string;
    prompt_desc: string;   

    constructor(prompt_name: string,  prompt_type: string,  file_path: string, id: string,
        customer_id: string,  prompt_desc: string){
        this.prompt_name = prompt_name;
        this.prompt_type = prompt_type;           
        this.file_path = file_path;
        this.id = id; 
        this.customer_id = customer_id;
        this.prompt_desc = prompt_desc;             
    }
}