import { UserRole } from "../utilities/user-role";
import { IsOptional, Length } from "class-validator";

export class ProfileInput {
  @IsOptional()
  firstName!: string;

  @IsOptional()
  lastName!: string;

  @Length(5, 6)
  @IsOptional()
  role!: UserRole;
}
