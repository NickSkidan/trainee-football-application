import { PlayerModel } from "../models/player-model";
import { PlayerInput } from "../dto/player-input";
import { DBOperation } from "./db-operation";

export class PlayerRepository extends DBOperation {
  constructor() {
    super();
  }

  async createPlayer(id: string, { name, age, position, playerPhotoUrl, price }: PlayerInput) {
    const queryString =
      "INSERT INTO players(name,age,position,player_photo_url,price,user_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [name, age, position, playerPhotoUrl, price, id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as PlayerModel;
      }
    }

    return null;
  }

  async getAllPlayers(
    offset: number = 0,
    limit?: number
  ): Promise<PlayerModel[]> {
    let queryString: string;
    let values: any[];

    if (limit) {
      queryString =
        "SELECT name, age, position, player_photo_url, price FROM players OFFSET $1 LIMIT $2";
      values = [offset, limit];
    } else {
      queryString =
        "SELECT name, age, position, player_photo_url, price FROM players OFFSET $1";
      values = [offset];
    }

    const result = await this.executeQuery(queryString, values);

    return result.rows as PlayerModel[];
  }

  async getPlayerById(id: string) {
    const queryString =
      "SELECT name, age, position, player_photo_url, price FROM players WHERE id=$1";
    const values = [id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as PlayerModel;
      }
    }

    return null;
  }

  async updatePlayer(
    id: string,
    { name, age, position, playerPhotoUrl, price }: PlayerInput
  ): Promise<PlayerModel | null> {
    const queryString =
      "UPDATE players SET name=$1, age=$2, position=$3, player_photo_url=$4, price=$5 WHERE id=$6 RETURNING *";
    const values = [name, age, position, playerPhotoUrl, price, id];

    const result = await this.executeQuery(queryString, values);

    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as PlayerModel;
      }
    }

    return null;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const queryString = "DELETE FROM players WHERE id=$1 RETURNING *";
    const values = [id];

    const result = await this.executeQuery(queryString, values);

    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }

  async getPlayerByUserId(userId: string) {
    const queryString =
      "SELECT name, age, position, player_photo_url, price, team_id FROM players WHERE user_id=$1";
    const values = [userId];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as PlayerModel;
      }
    }

    return null;
  }

  async updatePlayerTeamId(id: string, teamId: string): Promise<PlayerModel | null> {
    const queryString =
      "UPDATE players SET team_id=$1 WHERE id=$2 RETURNING *";
    const values = [teamId, id];

    const result = await this.executeQuery(queryString, values);

    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as PlayerModel;
      }
    }

    return null;
  }
}
