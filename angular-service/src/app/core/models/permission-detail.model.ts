export class PermissionDetail {
    id:any;
    permission_name: string;
    permission: any;     

    constructor(id: any, permission_name: string,  permission: any){
        this.id = id;
        this.permission_name = permission_name;
        this.permission = permission;              
    }
}
