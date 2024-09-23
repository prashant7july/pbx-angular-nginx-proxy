export class ServerDetail {
    created_at: string;
    service:string;
    ip: string;
    port: string;
    username: string;
    status: string;
    id:string;
    password:string;

    constructor(created_at: string , service: string , ip: string,
        port: string,  username: string, status: string,
        id: string,password:string)
    {
        this.created_at =created_at;       
        this.service = service;
        this.ip = ip;
        this.port = port;
        this.username = username;       
        this.status = status;         
        this.id = id;
        this.password = password;
   }
}
  