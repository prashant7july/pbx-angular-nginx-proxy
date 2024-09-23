export class Holiday {
    created_at: string;
    holiday: string;
    date: string;
    start_time: string;
    end_time: string;
    full_day: string;
    status: string;
    id: string;

    constructor(created_at: string, holiday: string, date: string, start_time: string, end_time: string,
        full_day: string,status: string, id: string) {
        this.created_at = created_at;
        this.holiday = holiday;
        this.date = date;
        this.start_time = start_time;
        this.end_time = end_time;
        this.full_day = full_day;
        this.status = status;
        this.id = id;
    }
}
