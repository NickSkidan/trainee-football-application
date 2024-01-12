import { PlayerPosition } from "../utilities/player-position";

export interface PlayerModel {
  id?: string;
  name?: string;
  age?: number;
  position?: PlayerPosition;
  userId?: string;
  teamId?: string;
  playerPhotoUrl?: string;
  price?: number;
}
