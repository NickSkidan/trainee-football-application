import { ErrorResponse, SuccessResponse } from "../utilities/response";
import { plainToClass } from "class-transformer";
import { AppValidationError } from "../utilities/errors";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { PlayerRepository } from "../repositories/player-repository";
import { PlayerInput } from "../dto/player-input";
import { autoInjectable } from "tsyringe";
import { VerifyToken } from "../utilities/password";
import { UserRepository } from "../repositories/user-repository";
import { UserRole } from "../utilities/user-role";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { TeamRepository } from "../repositories/team-repository";

@autoInjectable()
export class PlayerService {
  private _playerRepository: PlayerRepository;
  private _userRepository: UserRepository;
  private _teamRepository: TeamRepository;

  constructor(
    playerRepository: PlayerRepository,
    userRepository: UserRepository,
    teamRepository: TeamRepository
  ) {
    this._playerRepository = playerRepository;
    this._userRepository = userRepository;
    this._teamRepository = teamRepository;
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

      const userRole = await this._userRepository.getUserRoleById(payload.id);
      if (!userRole) {
        return ErrorResponse(404, "user was not found with provided id");
      }

      if (userRole.role !== UserRole.PLAYER) {
        return ErrorResponse(403, "You are not allowed to create player");
      }
      const input = plainToClass(PlayerInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this._playerRepository.createPlayer(payload.id, input);

      if (!data) {
        throw new Error("failed to create player");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getPlayer(event: APIGatewayProxyEventV2) {
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

    const data = await this._playerRepository.getPlayerById(playerId);
    if (!data) return ErrorResponse(404, "player was not found");
    return SuccessResponse(data);
  }

  async getPlayers(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload || !payload.id) {
      return ErrorResponse(403, "authorization failed!");
    }
    const data = await this._playerRepository.getAllPlayers();
    return SuccessResponse(data);
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

      const data = await this._playerRepository.updatePlayer(playerId, input);

      if (!data) {
        throw new Error("failed to update player");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async deletePlayer(event: APIGatewayProxyEventV2) {
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

    const data = await this._playerRepository.deletePlayer(playerId);
    if (!data) return ErrorResponse(404, "player was not found");
    return SuccessResponse({ msg: "player was successfully deleted" });
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

      const teamData = await this._teamRepository.getTeamById(teamId);
      if (!teamData) {
        return ErrorResponse(404, "team was not found");
      }

      const playerData = await this._playerRepository.getPlayerByUserId(
        payload.id
      );
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

      const updatedPlayer = await this._playerRepository.updatePlayerTeamId(
        playerData.id,
        teamId
      );
      const budget = teamData.budget - playerData.price;
      const updatedTeam = await this._teamRepository.updateTeamBudget(
        teamId,
        budget
      );
      if (!updatedPlayer || !updatedTeam) {
        return ErrorResponse(404, "error during updating entities");
      }
      if (!updatedPlayer) {
        return ErrorResponse(404, "error during updating player team id");
      }

      const message = {
        userId: payload.id,
        playerId: playerData.id,
        previousTeamId: playerData.teamId,
        currentTeamId: teamId,
        playerPrice: playerData.price,
      };

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
