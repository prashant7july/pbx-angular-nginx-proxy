export class CallQueue {
    created_at: string;
    name: string;
    max_waiting_call: string;
    welcome_prompt: string;
    moh: string;
    recording: string;
    ring_strategy:string;
    agent:string;
    periodic_announcement:string;
    periodic_announcement_time:string;
    periodic_announcement_prompt:string;
    play_position_on_call:string;
    play_position_periodically:string;
    id: string;
    is_extension :string;
    is_pstn :string;

    constructor(created_at: string, name: string, max_waiting_call: string,
        welcome_prompt: string, moh: string, recording: string, ring_strategy:string,
        agent:string,periodic_announcement:string,periodic_announcement_time:string,
        periodic_announcement_prompt:string,play_position_on_call:string,
        play_position_periodically:string,  id: string, is_extension : string, is_pstn :string) {

        this.created_at = created_at;
        this.name = name;
        this.max_waiting_call = max_waiting_call;
        this.welcome_prompt = welcome_prompt;
        this.moh = moh;
        this.recording = recording;
        this.ring_strategy=ring_strategy;
        this.agent=agent;
        this.periodic_announcement=periodic_announcement;
        this.periodic_announcement_time=periodic_announcement_time;
        this.periodic_announcement_prompt=periodic_announcement_prompt;
        this.play_position_on_call=play_position_on_call;
        this.play_position_periodically=play_position_periodically;
        this.id = id;
        this.is_extension = is_extension;
        this.is_pstn = is_pstn;
    }
}
