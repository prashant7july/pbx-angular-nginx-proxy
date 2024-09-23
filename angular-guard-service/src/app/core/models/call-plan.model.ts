export class CallPlan {
    created_at: string;
    name: string;
    lc_type: number;
    status: string;
    id: number;
    base_charge: number;
    bundle_type: number;

    constructor(created_at: string, name: string, lc_type: number,status: string, id: number, base_charge: number, bundle_type: number) {
        this.created_at = created_at;
        this.name = name;
        this.lc_type = lc_type;
        this.status = status;
        this.id = id;
        this.base_charge = base_charge;
        this.bundle_type = bundle_type;
    }
}
