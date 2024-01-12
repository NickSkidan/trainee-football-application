import { IsEmail, Length } from "class-validator";

export class LoginInput {
  @IsEmail()
  email!: string;

  @Length(8, 255)
  password!: string;
}
