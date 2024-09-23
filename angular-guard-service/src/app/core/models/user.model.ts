import { Role } from "./role.model";
export interface User {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
  role:Role;
  id:Int16Array;
  menu:[];
}
