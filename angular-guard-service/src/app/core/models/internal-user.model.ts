export class InternalUserData {
    company: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    mobile: string;
    product_name: string;
    role: string;
    status: string;
    id: string;
    country_code: string;


    constructor(company: string, first_name: string, last_name: string, username: string,
        email: string, mobile: string, product_name: string, role: string, status: string, id: string, country_code: string) {
        this.company = company;
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
        this.email = email;
        this.mobile = mobile;
        this.product_name = product_name;
        this.role = role;
        this.status = status;
        this.id = id;
        this.country_code= country_code;
    }
}