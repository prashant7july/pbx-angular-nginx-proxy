export class CallPlanRate {
    created_at: string;
    call_plan: string;
    dial_prefix: string;
    buying_rate: string;
    selling_rate: string;
    selling_min_duration: string;
    selling_billing_block: string;
    status: string;
    id: string;

    constructor(created_at: string, call_plan: string, dial_prefix: string, buying_rate: string,
        selling_rate: string, selling_min_duration: string, selling_billing_block: string,
        status: string, id: string) {
        this.created_at = created_at;
        this.call_plan = call_plan;
        this.dial_prefix = dial_prefix;
        this.buying_rate = buying_rate;
        this.selling_rate = selling_rate;
        this.selling_min_duration = selling_min_duration;
        this.selling_billing_block = selling_billing_block;
        this.status = status;
        this.id = id;
    }
}
