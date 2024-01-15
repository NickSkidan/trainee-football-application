import { ProfileInput } from "../dto/profile-input";
import { DBOperation } from "./db-operation";
import { ProfileEditInput } from "../dto/update-profile-input";
import { UserRole } from "../utilities/user-role";
import { UserModel } from "../models/user-model";

export interface UserRoleModel {
  role?: UserRole;
}

export class UserRepository extends DBOperation {
  constructor() {
    super();
  }

  async createUser({ email, password, phone }: UserModel) {
    const queryString =
      "INSERT INTO users(email,password,phone) VALUES($1,$2,$3) RETURNING *";
    const values = [email, password, phone];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
    }
  }

  async getUserByEmail(email: string) {
    const queryString =
      "SELECT id, email, password, verification_code, expiry FROM users WHERE email=$1";
    const values = [email];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount < 1) {
        throw new Error("user does not exist with provided email!");
      }
      return result.rows[0] as UserModel;
    }
  }

  async getUserByPhone(phone: string) {
    const queryString =
      "SELECT id, email, password, phone, verification_code, expiry FROM users WHERE phone=$1";
    const values = [phone];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount < 1) {
        throw new Error("user does not exist with provided phone!");
      }
      return result.rows[0] as UserModel;
    }
  }

  async updateVerificationCode(id: string, code: number, expiry: Date) {
    const queryString =
      "UPDATE users SET verification_code=$1, expiry=$2 WHERE id=$3 AND verified=FALSE RETURNING *";
    const values = [code, expiry, id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
      throw new Error("user already verified!");
    }
  }

  async updateVerifyUser(id: string) {
    const queryString =
      "UPDATE users SET verified=TRUE WHERE id=$1 AND verified=FALSE RETURNING *";
    const values = [id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
      throw new Error("user already verified!");
    }
  }

  async updateUser(
    id: string,
    firstName: string,
    lastName: string,
    role: string
  ) {
    const queryString =
      "UPDATE users SET first_name=$1, last_name=$2, role=$3 WHERE id=$4 RETURNING *";
    const values = [firstName, lastName, role, id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
      throw new Error("error during user update!");
    }
  }

  async createProfile(id: string, { firstName, lastName, role }: ProfileInput) {
    const updatedUser = await this.updateUser(id, firstName, lastName, role);
    return updatedUser;
  }

  async getUserProfile(id: string) {
    const queryString =
      "SELECT first_name, last_name, email, phone, role, verified, created_at FROM users WHERE id=$1";
    const values = [id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount < 1) {
        throw new Error("user does not exist with such id!");
      }
      return result.rows[0] as UserModel;
    }
  }

  async updateProfile(
    id: string,
    { firstName, lastName, role, phone }: ProfileEditInput
  ) {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (firstName !== undefined) {
      setClauses.push(`first_name=$${values.length + 1}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      setClauses.push(`last_name=$${values.length + 1}`);
      values.push(lastName);
    }
    if (role !== undefined) {
      setClauses.push(`role=$${values.length + 1}`);
      values.push(role);
    }
    if (phone !== undefined) {
      setClauses.push(`phone=$${values.length + 1}`);
      values.push(phone);
    }
    if (setClauses.length === 0) {
      throw new Error("No values provided for update");
    }

    const queryString = `UPDATE users SET ${setClauses.join(",")} WHERE id=$${
      values.length + 1
    } RETURNING *`;
    values.push(id);
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
      throw new Error("error during user update!");
    }
  }

  async getUserRoleById(id: string): Promise<UserRoleModel> {
    const queryString = "SELECT role FROM users WHERE id=$1";
    const values = [id];
    const result = await this.executeQuery(queryString, values);

    if (result.rowCount) {
      if (result.rowCount < 1) {
        throw new Error("User does not exist with provided id!");
      }

      const userRoleModel: UserRoleModel = {
        role: result.rows[0].role,
      };

      return userRoleModel;
    } else {
      throw new Error("No user found with the provided id");
    }
  }
}
