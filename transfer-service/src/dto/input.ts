import { Length } from "class-validator";

export class RawTransferInput {
  @Length(1)
  userId: string;
  @Length(1)
  playerId: string;
  previousTeamId: string;
  @Length(1)
  currentTeamId: string;
  playerPrice: number;
}

export interface CreateTransferInput {
  user_id: string;
  player_id: string;
  previous_team_id: string;
  current_team_id: string;
  player_price: number;
}
