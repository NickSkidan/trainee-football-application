import { plainToClass } from "class-transformer";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { autoInjectable } from "tsyringe";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { TeamInput } from "../../dto/team-input";
import { AppValidationError } from "../../utilities/errors";
import { VerifyToken } from "../../utilities/password";
import { ErrorResponse, SuccessResponse } from "../../utilities/response";
import { UserRole } from "../../utilities/user-role";
import { PlayerRepository } from "../repositories/player-repository";
import { TeamRepository } from "../repositories/team-repository";
import { UserRepository } from "../repositories/user-repository";

@autoInjectable()
export class TeamService {
  private teamRepository!: TeamRepository;
  private userRepository!: UserRepository;
  private playerRepository!: PlayerRepository;

  constructor(
    teamRepository: TeamRepository,
    userRepository: UserRepository,
    playerRepository: PlayerRepository
  ) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.playerRepository = playerRepository;
  }

  async ResponseWithError() {
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

      const id = payload.id;

      const user = await this.userRepository.getUserById(id);
      if (!user) throw new Error("user was not found");
      if (!user.role || user.role !== UserRole.COACH) {
        throw new Error("You are not allowed to perform this action");
      }

      const existingTeam = await this.teamRepository.getTeamByUser(user);

      if (existingTeam) {
        return ErrorResponse(409, "You already have a team");
      }
      const input = plainToClass(TeamInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this.teamRepository.createTeam(user, input);

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

      const data = await this.teamRepository.getTeamById(teamId);
      if (!data) return ErrorResponse(404, "team was not found");
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getTeams(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      if (!token) {
        return ErrorResponse(403, "authorization failed!");
      }

      const payload = await VerifyToken(token);
      if (!payload || !payload.id) {
        return ErrorResponse(403, "authorization failed!");
      }

      const data = await this.teamRepository.getAllTeams();
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
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

      const team = await this.teamRepository.getTeamById(teamId);
      if (!team) return ErrorResponse(404, "team was not found");

      const data = this.teamRepository.updateTeam(team, input);

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
      if (!id) return ErrorResponse(403, "null team id");

      const data = await this.teamRepository.deleteTeam(id);
      if (!data) return ErrorResponse(404, "team was not found");
      return SuccessResponse({ msg: "team was successfully deleted" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
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

      const playerData = await this.playerRepository.getPlayerById(playerId);
      if (!playerData) {
        return ErrorResponse(404, "player was not found");
      }

      const userId = payload.id;
      const teamData = await this.teamRepository.getTeamByUserId(userId);
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
        playerId: playerId,
        previousTeamId: previousTeamId,
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
