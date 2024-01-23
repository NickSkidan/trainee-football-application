import { PlayerPosition } from "../utilities/player-position";

export interface PlayerModel {
  id?: string;
  name?: string;
  age?: number;
  position?: PlayerPosition;
  user_id?: string;
  team_id?: string;
  player_photo_url?: string;
  price?: number;
}
