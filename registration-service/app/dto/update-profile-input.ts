import { IsOptional, Length } from "class-validator";
import { ProfileInput } from "./profile-input";

export class ProfileEditInput extends ProfileInput {
    @Length(10, 13)
    @IsOptional()
    phone!: string;
}