
export class RatePlan {

    id:string;
    name :String;
    feature_rate:string;
    feature_limit: string;
    feature_name :string;
    description: string;
    amount : string;
    created_at: string;
    price : string;
    country: Number;



    constructor(created_at: string , feature_rate: string , feature_limit: string,
        feature_name: string, description: string,  amount : string, name :String,
        id: string,  price : string, country : Number) {
            
            this.id=id;
            this.name = name;
            this.feature_rate= feature_rate ;
            this.feature_limit= feature_limit ;
            this.feature_name= feature_name;
            this.description = description;
            this.amount = amount;
            this.created_at = created_at;
            this.price  = price;
            this.country = country;
    }
}