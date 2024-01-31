import { Repository } from "typeorm";
import { Team } from "../entities/team";
import { initializedDataSource } from "../utils/initialize-data-source";
import { TeamInput } from "../../dto/team-input";
import { User } from "../entities/user";

export class TeamRepository {
  private repository?: Repository<Team>;

  private async getRepository(): Promise<Repository<Team>> {
    if (!this.repository) {
      const dataSource = await initializedDataSource;
      this.repository = dataSource.getRepository(Team);
    }
    return this.repository;
  }

  async createTeam(
    user: User,
    { name, formation, teamLogoUrl, budget }: TeamInput
  ): Promise<Team> {
    const repository = await this.getRepository();
    const team = new Team();
    team.name = name;
    team.formation = formation;
    team.team_logo_url = teamLogoUrl;
    team.budget = budget;
    team.user = user;

    return await repository.save(team);
  }

  async getTeamByUser(user: User) {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { user: user },
    });
  }

  async getAllTeams(offset: number = 0, limit?: number): Promise<Team[]> {
    const repository = await this.getRepository();
    if (limit) {
      return await repository.find({ skip: offset, take: limit });
    } else {
      return await repository.find({ skip: offset });
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { id } });
  }

  async updateTeam(
    team: Team,
    { name, formation, teamLogoUrl, budget }: TeamInput
  ): Promise<Team | null> {
    const repository = await this.getRepository();
    team.name = name;
    team.formation = formation;
    team.team_logo_url = teamLogoUrl;
    team.budget = budget;

    return await repository.save(team);
  }

  async deleteTeam(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const result = await repository.delete(id);
    if (!result || !result.affected) return false;
    return result.affected > 0;
  }

  async getTeamByUserId(userId: string): Promise<Team | null> {
    const repository = await this.getRepository();
    return repository
      .createQueryBuilder("team")
      .innerJoin("team.user", "user")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  async updateTeamBudget(team: Team, budget: number): Promise<Team | null> {
    const repository = await this.getRepository();

    team.budget = budget;
    return await repository.save(team);
  }
}
