import { TeamFormation } from "../utilities/team-formation";
import { IsNumber, Length } from "class-validator";

export class TeamInput {
  @Length(3, 128)
  name!: string;

  formation!: TeamFormation;

  teamLogoUrl!: string;

  @IsNumber()
  budget!: number;
}