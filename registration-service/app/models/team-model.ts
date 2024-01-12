import { TeamFormation } from "../utilities/team-formation";

export interface TeamModel {
  id?: string;
  name?: string;
  formation?: TeamFormation;
  userId?: string;
  teamLogoUrl?: string;
  budget?: number;
}
