
import { TeamModel } from "../models/team-model";
import { TeamInput } from "../dto/team-input";
import { DBOperation } from "./db-operation";

export class TeamRepository extends DBOperation {
  constructor() {
    super();
  }

  async createTeam(
    id: string,
    { name, formation, teamLogoUrl, budget }: TeamInput
  ) {
    const queryString =
      "INSERT INTO teams(name,formation,team_logo_url,budget,user_id) VALUES($1,$2,$3,$4,$5) RETURNING *";
    const values = [name, formation, teamLogoUrl, budget, id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as TeamModel;
      }
    }

    return null;
  }

  async getAllTeams(offset: number = 0, limit?: number): Promise<TeamModel[]> {
    let queryString: string;
    let values: any[];

    if (limit) {
      queryString =
        "SELECT id, name, formation, team_logo_url, budget FROM teams OFFSET $1 LIMIT $2";
      values = [offset, limit];
    } else {
      queryString =
        "SELECT id, name, formation, team_logo_url, budget FROM teams OFFSET $1";
      values = [offset];
    }

    const result = await this.executeQuery(queryString, values);

    return result.rows as TeamModel[];
  }

  async getTeamById(id: string) {
    const queryString =
      "SELECT id, name, formation, team_logo_url, budget FROM teams WHERE id=$1";
    const values = [id];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as TeamModel;
      }
    }

    return null;
  }

  async updateTeam(
    id: string,
    { name, formation, teamLogoUrl, budget }: TeamInput
  ): Promise<TeamModel | null> {
    const queryString =
      "UPDATE teams SET name=$1, formation=$2, team_logo_url=$4, budget=$5 WHERE id=$6 RETURNING *";
    const values = [name, formation, teamLogoUrl, budget, id];

    const result = await this.executeQuery(queryString, values);

    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as TeamModel;
      }
    }

    return null;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const queryString = "DELETE FROM teams WHERE id=$1 RETURNING *";
    const values = [id];

    const result = await this.executeQuery(queryString, values);

    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }

  async getTeamByUserId(userId: string) {
    const queryString =
      "SELECT id, name, formation, team_logo_url, budget FROM teams WHERE user_id=$1";
    const values = [userId];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as TeamModel;
      }
    }

    return null;
  }

  async updateTeamBudget(id: string, budget: number): Promise<TeamModel | null> {
    const queryString =
      "UPDATE teams SET budget=$1 WHERE id=$2 RETURNING *";
    const values = [budget, id];

    const result = await this.executeQuery(queryString, values);

    if (result.rowCount) {
      if (result.rowCount > 0) {
        return result.rows[0] as TeamModel;
      }
    }

    return null;
  }
}
