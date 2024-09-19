import { StringifyOptions } from 'querystring';

export class ExtensionFeature {
    dnd: boolean;
    black_list: boolean;
    recording: boolean;
    call_transfer: boolean;
    forward: boolean;
    outbound: boolean;
    speed_dial: boolean;
    voicemail: boolean;
    balance_restriction: boolean;
    multiple_registration: boolean;
    name: string;
    number: string;
    id: string;
    customer_id: string;

    constructor(dnd: boolean, black_list: boolean, recording: boolean, call_transfer: boolean,
        forward: boolean, outbound: boolean, speed_dial: boolean, voicemail: boolean, balance_restriction: boolean,
        multiple_registration: boolean, name: string, number: string, id: string, customer_id: string) {
        this.dnd = dnd;
        this.black_list = black_list;
        this.recording = recording;
        this.call_transfer = call_transfer;
        this.forward = forward;
        this.outbound = outbound;
        this.speed_dial = speed_dial;
        this.voicemail = voicemail;
        this.balance_restriction = balance_restriction;
        this.multiple_registration = multiple_registration;
        this.name = name;
        this.number = number;
        this.id = id;
        this.customer_id = customer_id;
    }
}