export class Assignrights {
    userid: string;
    username: string;
    pkgid: string;
    pkgname: string;
    prodid: string;


    constructor(userid: string, username: string, pkgid: string, pkgname: string, prodid: string) {
        this.userid = userid;
        this.username = username;
        this.pkgid = pkgid;
        this.pkgname = pkgname;
        this.prodid = prodid;
    }
}
