export class BundlePlan {
    id: string;
    name : string;
    charge : number;
    plan_type : string;
    validity : string;
    call_plan : string;
    is_overuse : boolean;
    fee_type_charges : any;
  
    constructor(name: string, id: string, minutes : number, plan_type : string, validity : string, call_plan : string, is_overuse : boolean, fee_type_charges : any) {
        this.id = id;
        this.name = name;
        this.charge = minutes;
        this.plan_type =  plan_type;
        this.validity = validity;
        this.call_plan = call_plan;
        this.is_overuse = is_overuse;
        this.fee_type_charges = fee_type_charges;
    }
}
