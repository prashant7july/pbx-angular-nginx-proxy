export class CDR {
    Callee: string;
    Caller: string
    StartTime: string;
    EndTime:string
    CallDuration: string;
    Type: string;
    HangupReason:string;

    constructor(Callee: string, Caller: string, StartTime: string, EndTime: string,
        CallDuration: string, Type: string,HangupReason:string){
        this.Callee = Callee;
        this.Caller = Caller;
        this.StartTime = StartTime;
        this.EndTime = EndTime;
        this.CallDuration = CallDuration;
        this.Type = Type;
        this.HangupReason = HangupReason;
    }
}