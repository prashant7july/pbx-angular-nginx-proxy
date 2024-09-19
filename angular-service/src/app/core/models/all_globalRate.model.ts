
export class AllGlobalRate {

    id:string;
    feature_rate:string;
    feature_limit: string;
    feature_name :string;
    created_at: string;


    constructor(created_at: string , feature_rate: string , feature_limit: string,
        feature_name: string,  description: string, status: string,
        id: string) {
            
            this.id = id;
            this.created_at= created_at; 
            this.feature_rate= feature_rate ;
            this.feature_limit= feature_limit ;
            this.feature_name= feature_name;
    }
}