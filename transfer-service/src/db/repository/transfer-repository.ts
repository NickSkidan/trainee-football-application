import { Repository } from "typeorm";
import { Transfer } from "../entity/transfer";
import { initializedDataSource } from "../utils/initialize-data-source";
import { RawTransferInput } from "../../dto/input";

export class TransferRepository {
  private repository?: Repository<Transfer>;

  private async getRepository(): Promise<Repository<Transfer>> {
    if (!this.repository) {
      const dataSource = await initializedDataSource;
      this.repository = dataSource.getRepository(Transfer);
    }
    return this.repository;
  }

  async createTransfer({
    userId,
    playerId,
    previousTeamId,
    currentTeamId,
    playerPrice,
  }: RawTransferInput): Promise<Transfer> {
    const repository = await this.getRepository();
    const transfer = new Transfer();
    transfer.user_id = userId;
    transfer.player_id = playerId;
    transfer.previous_team_id = previousTeamId;
    transfer.current_team_id = currentTeamId;
    transfer.player_price = playerPrice;

    return await repository.save(transfer);
  }

  async getTransferByUserId(userId: string) {
    const repository = await this.getRepository();
    return repository.find({ where: { user_id: userId } });
  }

  async getAllTransfers(
    offset: number = 0,
    limit?: number
  ): Promise<Transfer[]> {
    const repository = await this.getRepository();
    if (limit) {
      return await repository.find({ skip: offset, take: limit });
    } else {
      return await repository.find({ skip: offset });
    }
  }
}
