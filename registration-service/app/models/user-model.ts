import { UserRole } from "../utilities/user-role";

export interface UserModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
  verification_code?: number;
  expiry?: string;
}
