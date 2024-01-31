import { Length } from "class-validator";

export class VerificationInput {
  @Length(5)
  code!: string;
}
