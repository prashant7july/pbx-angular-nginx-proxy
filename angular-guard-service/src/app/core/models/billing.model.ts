export class BillingData {
    date: string;
    number: string;
    company: string;
    description: string;
    amount: string;
    id: string;

    constructor(date: string, number: string, company: string, description: string, amount: string, id: string) {
        this.date = date;
        this.number = number;
        this.company = company;
        this.description = description;
        this.amount = amount;
        this.id = id;
    }
}