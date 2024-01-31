import { plainToClass } from "class-transformer";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { autoInjectable } from "tsyringe";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { ErrorResponse, SuccessResponse } from "../../utilities/response";
import { PlayerInput } from "../../dto/player-input";
import { AppValidationError } from "../../utilities/errors";
import { VerifyToken } from "../../utilities/password";
import { UserRole } from "../../utilities/user-role";
import { PlayerRepository } from "../repositories/player-repository";
import { UserRepository } from "../repositories/user-repository";
import { TeamRepository } from "../repositories/team-repository";

@autoInjectable()
export class PlayerService {
  private playerRepository!: PlayerRepository;
  private userRepository!: UserRepository;
  private teamRepository!: TeamRepository;

  constructor(
    playerRepository: PlayerRepository,
    userRepository: UserRepository,
    teamRepository: TeamRepository
  ) {
    this.playerRepository = playerRepository;
    this.userRepository = userRepository;
    this.teamRepository = teamRepository;
  }

  async ResponseWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(404, "requested method is not supported!");
  }

  async createPlayer(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }
      const input = plainToClass(PlayerInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const id = payload.id;

      const user = await this.userRepository.getUserById(id);
      if (!user) throw new Error("user was not found");
      if (!user.role || user.role !== UserRole.PLAYER) {
        throw new Error("You are not allowed to perform this action");
      }

      const existingPlayer = await this.playerRepository.getPlayerByUser(user);

      if (existingPlayer) {
        throw new Error("You already have a player");
      }

      const data = await this.playerRepository.createPlayer(user, input);

      if (!data) {
        throw new Error("Failed to create player");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getPlayer(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }

      const playerId = event.pathParameters?.id;
      if (!playerId) return ErrorResponse(403, "null player id");

      const data = await this.playerRepository.getPlayerById(playerId);
      if (!data) return ErrorResponse(404, "player was not found");
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getPlayers(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }

      const data = await this.playerRepository.getAllPlayers();
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async editPlayer(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }
      const playerId = event.pathParameters?.id;
      if (!playerId) return ErrorResponse(403, "null player id");

      const input = plainToClass(PlayerInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this.playerRepository.updatePlayer(playerId, input);

      if (!data) {
        throw new Error("Failed to update player");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async deletePlayer(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }
      const id = event.pathParameters?.id;
      if (!id) return ErrorResponse(403, "null player id");

      const data = await this.playerRepository.deletePlayer(id);
      if (!data) return ErrorResponse(404, "player was not found");
      return SuccessResponse({ msg: "player was successfully deleted" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async joinTeam(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }

      const teamId = event.pathParameters?.teamId;
      if (!teamId) {
        return ErrorResponse(403, "null team id");
      }

      const teamData = await this.teamRepository.getTeamById(teamId);
      if (!teamData) {
        return ErrorResponse(404, "team was not found");
      }

      const userId = payload.id;
      const playerData = await this.playerRepository.getPlayerByUserId(userId);
      if (!playerData) {
        return ErrorResponse(404, "player was not found");
      }

      if (!playerData.id) {
        return ErrorResponse(404, "player id is null");
      }

      if (
        !teamData.budget ||
        !playerData.price ||
        teamData.budget < playerData.price
      ) {
        return ErrorResponse(
          403,
          "Team budget is not enough for your player price"
        );
      }

      const previousTeamId = playerData.team?.id;
      console.log("Previous team id:", previousTeamId);
      const updatedPlayer = await this.playerRepository.updatePlayerTeamId(
        playerData,
        teamData
      );

      const budget = teamData.budget - playerData.price;
      const updatedTeam = await this.teamRepository.updateTeamBudget(
        teamData,
        budget
      );
      if (!updatedPlayer || !updatedTeam) {
        return ErrorResponse(404, "error during updating entities");
      }

      const message = {
        userId: payload.id,
        playerId: playerData.id,
        previousTeamId: previousTeamId,
        currentTeamId: teamId,
        playerPrice: playerData.price,
      };

      console.log("Message:", JSON.stringify(message));
      const input = {
        Message: JSON.stringify(message),
        TopicArn: process.env.SNS_TOPIC,
        MessageAttributes: {
          actionType: {
            DataType: "String",
            StringValue: "processTransfer",
          },
        },
      };
      const client = new SNSClient();
      const command = new PublishCommand(input);
      const response = await client.send(command);

      return SuccessResponse({ msg: "Transfer Processing...", response });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }
}
