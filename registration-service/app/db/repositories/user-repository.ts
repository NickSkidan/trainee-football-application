import { Repository } from "typeorm";
import { User } from "../entities/user";
import { initializedDataSource } from "../utils/initialize-data-source";
import { UserRole } from "../../utilities/user-role";
import { ProfileInput } from "../../dto/profile-input";
import { ProfileEditInput } from "../../dto/update-profile-input";

export class UserRepository {
  private repository?: Repository<User>;

  private async getRepository(): Promise<Repository<User>> {
    if (!this.repository) {
      const dataSource = await initializedDataSource;
      this.repository = dataSource.getRepository(User);
    }
    return this.repository;
  }

  async createUser({
    email,
    password,
    phone,
  }: {
    email: string;
    password: string;
    phone: string;
  }) {
    const repository = await this.getRepository();
    const user = new User();
    user.email = email;
    user.password = password;
    user.phone = phone;

    return await repository.save(user);
  }

  async getUserById(id: string) {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { id } });
  }

  async getUserByEmail(email: string) {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { email: email } });
  }

  async getUserByPhone(phone: string) {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { phone: phone } });
  }

  async updateVerificationCode(user: User, code: number, expiry: Date) {
    const repository = await this.getRepository();

    user.verification_code = code;
    user.expiry = expiry;
    return await repository.save(user);
  }

  async updateVerifyUser(id: string) {
    const repository = await this.getRepository();
    const user = await repository.findOne({
      where: { id, verified: false },
    });
    if (!user) {
      throw new Error("User not found or already verified!");
    }

    user.verified = true;

    return await repository.save(user);
  }

  async updateUser(
    id: string,
    firstName: string,
    lastName: string,
    role: string
  ) {
    const repository = await this.getRepository();
    const user = await repository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found!");
    }

    user.first_name = firstName;
    user.last_name = lastName;
    user.role = role as UserRole;

    return await repository.save(user);
  }

  async createProfile(id: string, { firstName, lastName, role }: ProfileInput) {
    return await this.updateUser(id, firstName, lastName, role);
  }

  async getUserProfile(id: string) {
    const repository = await this.getRepository();
    return await repository.findOne({
      select: [
        "first_name",
        "last_name",
        "email",
        "phone",
        "role",
        "verified",
        "created_at",
      ],
      where: { id },
    });
  }

  async updateProfile(
    user: User,
    { firstName, lastName, role, phone }: ProfileEditInput
  ) {
    const repository = await this.getRepository();
    if (firstName !== undefined) {
      user.first_name = firstName;
    }
    if (lastName !== undefined) {
      user.last_name = lastName;
    }
    if (role !== undefined) {
      user.role = role;
    }
    if (phone !== undefined) {
      user.phone = phone;
    }

    return await repository.save(user);
  }
}
