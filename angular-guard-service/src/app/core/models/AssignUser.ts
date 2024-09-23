
export class assign {

    id:string;
    support_group_id :string;
    support_user_id: string;
    created_at: string;


constructor(
    created_at: string, 
    support_user_id: string, 
    support_group_id: string, 
        id: string
    ) {
        
        this.id = id;
        this.support_group_id= support_group_id;
        this.support_user_id= support_user_id ;
        this. created_at=  created_at; 
        
    }
}