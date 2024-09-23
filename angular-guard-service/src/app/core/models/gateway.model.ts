export class Gateway {    	
    created_at: string;
    provider:string;
    ip:string;
    port:string;
    username:string;
    auth_username:string;
    password:string;
    register:string;
    expiry_sec:string;
    ping:string;
    retry_sec:string;
    prependDigit_dialnumber:string;
    prependDigit__callerID:string;
    callerID:string;
    callerID_header:string;
    callerID_headertype:string;
    callerID_headervalue:string;
    codec:string;
    transport_type:string;
    dtmf_type:string;
    calling_profile:string;
    status:string;
    simultaneous_call:string;
    id:string;

    constructor(
        created_at: string,provider:string, ip:string, port:string,  username:string, auth_username:string,
        password:string,  register:string, expiry_sec:string,   ping:string, retry_sec:string,
        prependDigit_dialnumber:string,prependDigit__callerID:string, callerID:string,
        callerID_header:string,  callerID_headertype:string,  callerID_headervalue:string,
        codec:string, transport_type:string,dtmf_type:string,  calling_profile:string,
        status:string,simultaneous_call:string,id:string)
    {
        this.created_at=created_at;
        this.provider=provider;
        this.ip=ip;
        this.port=port;
        this.username=username;
        this.auth_username=auth_username;
        this.password=password;
        this.register=register;
        this.expiry_sec=expiry_sec;
        this.ping=ping;
        this.retry_sec=retry_sec;
        this.prependDigit_dialnumber=prependDigit_dialnumber;
        this.prependDigit__callerID=prependDigit__callerID;
        this.callerID=callerID;
        this.callerID_header=callerID_header;
        this.callerID_headertype=callerID_headertype;
        this.callerID_headervalue=callerID_headervalue;
        this.codec=codec;
        this.transport_type=transport_type;
        this.dtmf_type=dtmf_type;
        this.calling_profile=calling_profile;
        this.status=status;
        this.simultaneous_call=simultaneous_call;
        this.id=id;
       
   }
}
  