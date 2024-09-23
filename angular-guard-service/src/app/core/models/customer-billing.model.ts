export class CustomerBillingData {
    date: string;
    number: string;
    description: string;
    amount: string;
    id: string;

    constructor(date: string, number: string, description: string, amount: string, id: string) {
        this.date = date;
        this.number = number;
        this.description = description;
        this.amount = amount;
        this.id = id;
    }
}