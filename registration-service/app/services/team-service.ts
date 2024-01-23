import { ErrorResponse, SuccessResponse } from "../utilities/response";
import { plainToClass } from "class-transformer";
import { AppValidationError } from "../utilities/errors";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { TeamRepository } from "../repositories/team-repository";
import { autoInjectable } from "tsyringe";
import { VerifyToken } from "../utilities/password";
import { TeamInput } from "../dto/team-input";
import { UserRepository } from "../repositories/user-repository";
import { UserRole } from "../utilities/user-role";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { PlayerRepository } from "../repositories/player-repository";

@autoInjectable()
export class TeamService {
  private _teamRepository: TeamRepository;
  private _userRepository: UserRepository;
  private _playerRepository: PlayerRepository;

  constructor(
    teamRepository: TeamRepository,
    userRepository: UserRepository,
    playerRepository: PlayerRepository
  ) {
    this._teamRepository = teamRepository;
    this._userRepository = userRepository;
    this._playerRepository = playerRepository;
  }

  async ResponseWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(404, "requested method is not supported!");
  }

  async createTeam(event: APIGatewayProxyEventV2) {
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

      if (userRole.role !== UserRole.COACH) {
        return ErrorResponse(403, "You are not allowed to create team");
      }

      const input = plainToClass(TeamInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this._teamRepository.createTeam(payload.id, input);

      if (!data) {
        throw new Error("failed to create team");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getTeam(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload || !payload.id) {
      return ErrorResponse(403, "authorization failed!");
    }
    const teamId = event.pathParameters?.id;
    if (!teamId) return ErrorResponse(403, "null team id");

    const data = await this._teamRepository.getTeamById(teamId);
    if (!data) return ErrorResponse(404, "team was not found");
    return SuccessResponse(data);
  }

  async getTeams(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload || !payload.id) {
      return ErrorResponse(403, "authorization failed!");
    }
    const data = await this._teamRepository.getAllTeams();
    return SuccessResponse(data);
  }

  async editTeam(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }
      const teamId = event.pathParameters?.id;
      if (!teamId) return ErrorResponse(403, "null team id");

      const input = plainToClass(TeamInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this._teamRepository.updateTeam(teamId, input);

      if (!data) {
        throw new Error("failed to update team");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async deleteTeam(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload || !payload.id) {
      return ErrorResponse(403, "authorization failed!");
    }
    const teamId = event.pathParameters?.id;
    if (!teamId) return ErrorResponse(403, "null team id");

    const data = await this._teamRepository.deleteTeam(teamId);
    if (!data) return ErrorResponse(404, "team was not found");
    return SuccessResponse({ msg: "team was successfully deleted" });
  }

  async addPlayer(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }
      const playerId = event.pathParameters?.playerId;
      if (!playerId) return ErrorResponse(403, "null player id");

      const playerData = await this._playerRepository.getPlayerById(playerId);
      if (!playerData) {
        return ErrorResponse(404, "player was not found");
      }
      console.log("PLAYER_DATA:", playerData);

      const teamData = await this._teamRepository.getTeamByUserId(payload.id);
      if (!teamData) {
        return ErrorResponse(404, "team was not found");
      }

      if (!teamData.id) {
        return ErrorResponse(404, "team id is null");
      }

      if (
        !teamData.budget ||
        !playerData.price ||
        teamData.budget < playerData.price
      ) {
        return ErrorResponse(
          403,
          "Your team budget is not enough to buy this player"
        );
      }

      const updatedPlayer = await this._playerRepository.updatePlayerTeamId(
        playerId,
        teamData.id
      );
      const budget = teamData.budget - playerData.price;
      const updatedTeam = await this._teamRepository.updateTeamBudget(
        teamData.id,
        budget
      );
      if (!updatedPlayer || !updatedTeam) {
        return ErrorResponse(404, "error during updating entities");
      }

      const message = {
        userId: payload.id,
        playerId: playerId,
        previousTeamId: playerData.team_id,
        currentTeamId: teamData.id,
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
