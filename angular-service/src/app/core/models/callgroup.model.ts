export class Callgroup {
    created_at: string;
    name: string;
    group_ext: string;
    group_type: string;
    grpType: string;
    ringtimeout: string;
    sip: string;
    customer_id: string;
    moh: string;
    recording: string;
    recordingDisplay:string;
    id: string;

    constructor(created_at: string, name: string, group_ext: string, group_type: string, grpType: string, ringtimeout: string,
        sip: string, customer_id: string, moh: string, recording: string, recordingDisplay:string, id: string) {

        this.created_at = created_at;
        this.name = name;
        this.group_ext = group_ext;
        this.group_type = group_type;
        this.grpType = grpType;
        this.ringtimeout = ringtimeout;
        this.sip = sip;
        this.customer_id = customer_id;
        this.moh = moh;
        this.recording = recording;
        this.recordingDisplay = recordingDisplay;
        this.id = id;
    }
}
