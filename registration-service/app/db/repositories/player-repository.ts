import { Repository } from "typeorm";
import { Player } from "../entities/player";
import { PlayerInput } from "../../dto/player-input";
import { initializedDataSource } from "../utils/initialize-data-source";
import { User } from "../entities/user";
import { Team } from "../entities/team";

export class PlayerRepository {
  private repository?: Repository<Player>;

  private async getRepository(): Promise<Repository<Player>> {
    if (!this.repository) {
      const dataSource = await initializedDataSource;
      this.repository = dataSource.getRepository(Player);
    }
    return this.repository;
  }

  async createPlayer(
    user: User,
    { name, age, position, playerPhotoUrl, price }: PlayerInput
  ): Promise<Player> {
    const repository = await this.getRepository();
    const player = new Player();
    player.name = name;
    player.age = age;
    player.position = position;
    player.player_photo_url = playerPhotoUrl;
    player.price = price;
    player.user = user;

    return await repository.save(player);
  }

  async getPlayerByUser(user: User) {
    const repository = await this.getRepository();
    return await repository.findOne({
      where: { user: user },
    });
  }

  async getAllPlayers(offset: number = 0, limit?: number): Promise<Player[]> {
    const repository = await this.getRepository();
    if (limit) {
      return await repository.find({ skip: offset, take: limit });
    } else {
      return await repository.find({ skip: offset });
    }
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { id } });
  }

  async updatePlayer(
    id: string,
    { name, age, position, playerPhotoUrl, price }: PlayerInput
  ): Promise<Player | null> {
    const repository = await this.getRepository();
    const player = await repository.findOne({ where: { id } });
    if (!player) return null;

    player.name = name;
    player.age = age;
    player.position = position;
    player.player_photo_url = playerPhotoUrl;
    player.price = price;

    return await repository.save(player);
  }

  async deletePlayer(id: string): Promise<boolean> {
    const repository = await this.getRepository();
    const result = await repository.delete(id);
    if (!result || !result.affected) return false;
    return result.affected > 0;
  }

  async getPlayerByUserId(userId: string): Promise<Player | null> {
    const repository = await this.getRepository();
    return repository
      .createQueryBuilder("player")
      .innerJoinAndSelect("player.user", "user")
      .leftJoinAndSelect("player.team", "team")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  async updatePlayerTeamId(player: Player, team: Team): Promise<Player | null> {
    const repository = await this.getRepository();

    player.team = team;
    return await repository.save(player);
  }

  async updatePlayerPhotoUrl(id: string, imageUrl: string): Promise<boolean> {
    const repository = await this.getRepository();
    const player = await repository.findOne({ where: { id } });
    if (player) {
      player.player_photo_url = imageUrl;
      await repository.save(player);
      return true;
    }
    return false;
  }
}
