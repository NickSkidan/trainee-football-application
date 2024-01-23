import { UserRole } from "../utilities/user-role";

export interface UserModel {
  id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  verification_code?: number;
  expiry?: string;
}
