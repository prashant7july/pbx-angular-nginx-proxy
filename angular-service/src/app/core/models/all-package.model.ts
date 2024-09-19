export class PackageData {
    product_name: string;
    name: string;     
    duration: string;
    id: string;   
    created_at: string;
    status: string;    
    product_id: string;
    feature_id: string;
   

    constructor(product_name: string,  name: string,  duration: string, feature_id: string,
         product_id: string,  status: string, created_at: string, id: string){
        this.product_name = product_name;
        this.name = name;           
        this.duration = duration;
          
        this.feature_id = feature_id;
        this.product_id = product_id;
        
        this.status = status;
        this.created_at = created_at;
        
        this.id = id;       
    }
}