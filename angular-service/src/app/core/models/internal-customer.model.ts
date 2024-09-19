export class InternalCustomerData {
    company_name: string;
    name: string;
    email: string;
    mobile: string;
    status: string;
    id: string;
    package_name: string;


    constructor(company_name: string, name: string,
        email: string, mobile: string, status: string, id:string, package_name: string) 
        {
        this.company_name = company_name;
        this.name = name;       
        this.email = email;
        this.mobile = mobile;
        this.status = status;
        this.id=id;
        this.package_name=package_name;
    }
}