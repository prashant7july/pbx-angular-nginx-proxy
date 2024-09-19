export class Conference {
    created_at: string;
    name: string;
    conf_ext: string;
    conf_join_start_date: string;
    conf_join_end_date: string;
    admin_pin: string;
    participant_pin: string;
    customer_id: string;
    welcome_prompt: string;
    moh: string;
    recording: string;
    status: string;
    id: string;

    constructor(created_at: string, name: string, conf_ext: string, conf_join_start_date: string,
        conf_join_end_date: string, admin_pin: string, participant_pin: string, customer_id: string,
        welcome_prompt: string, moh: string, recording: string, status: string, id: string) {

        this.created_at = created_at;
        this.name = name;
        this.conf_ext = conf_ext;
        this.conf_join_start_date = conf_join_start_date;
        this.conf_join_end_date = conf_join_end_date;
        this.admin_pin = admin_pin;
        this.participant_pin = participant_pin;
        this.customer_id = customer_id;
        this.welcome_prompt = welcome_prompt;
        this.moh = moh;
        this.recording = recording;
        this.status = status;
        this.id = id;
    }
}
