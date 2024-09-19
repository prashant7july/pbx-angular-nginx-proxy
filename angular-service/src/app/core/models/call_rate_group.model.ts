export class CallRateGroup {
    id: string;
    name : string;
    minutes : number;

    constructor(name: string, id: string, minutes : number) {
        this.id = id;
        this.name = name;
        this.minutes = minutes;
    }
}
