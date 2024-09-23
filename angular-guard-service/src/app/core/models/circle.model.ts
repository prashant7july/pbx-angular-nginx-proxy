export class circle {
    created_at: string;
    description:string;
    name :string;
    id: string;

    constructor(created_at: string, description:string, name :string,  id: string) {
        this.created_at = created_at;
        this.description= description;
        this.name = name;
        this.id = id;
    }
}