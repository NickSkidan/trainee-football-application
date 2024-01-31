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
