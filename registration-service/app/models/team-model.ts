import { TeamFormation } from "../utilities/team-formation";

export interface TeamModel {
  id?: string;
  name?: string;
  formation?: TeamFormation;
  user_id?: string;
  team_logo_url?: string;
  budget?: number;
}
