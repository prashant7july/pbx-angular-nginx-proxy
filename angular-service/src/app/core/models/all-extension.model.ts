export class AllExtension {

    ext_number: string;
    ext_web_username: string;
    caller_id_name: string;
    external_caller_id: string;
    email: string;
    codec: string;
    id: string;
    customer_id: string;

    constructor(ext_number: string, ext_web_username: string,
        caller_id_name: string, external_caller_id: string, email: string,
        codec: string, id: string, customer_id: string) {

        this.ext_number = ext_number;
        this.ext_web_username = ext_web_username;
        this.caller_id_name = caller_id_name;
        this.external_caller_id = external_caller_id;
        this.email = email;
        this.codec = codec;
        this.id = id;
        this.customer_id = customer_id;
    }
}