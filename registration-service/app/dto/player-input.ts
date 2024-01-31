import { PlayerPosition } from "../utilities/player-position";
import { IsNumber, Length } from "class-validator";

export class PlayerInput {
  @Length(3, 128)
  name!: string;

  @IsNumber()
  age!: number;

  position!: PlayerPosition;

  playerPhotoUrl!: string;

  @IsNumber()
  price!: number;
}
