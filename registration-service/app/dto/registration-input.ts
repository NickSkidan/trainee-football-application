import { Length } from "class-validator";
import { LoginInput } from "./login-input";

export class RegistrationInput extends LoginInput {
  @Length(10, 13)
  phone!: string;
}