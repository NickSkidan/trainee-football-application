import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { TeamService } from "../db/services/team-service";

const service = container.resolve(TeamService);

export const TeamHandler = middy((event: APIGatewayProxyEventV2) => {
  const { path, method } = event.requestContext.http;

  switch (true) {
    case path.startsWith("/teams"):
      return handleTeamsRoute(path, method, event);

    case path.startsWith("/addPlayer"):
      return handleAddPlayerRoute(method, event);

    default:
      return service.ResponseWithError(event);
  }
}).use(bodyParser());

function handleTeamsRoute(
  path: string,
  method: string,
  event: APIGatewayProxyEventV2
) {
  if (method.toLowerCase() === "post") {
    return service.createTeam(event);
  } else if (method.toLowerCase() === "get") {
    if (path === "/teams") {
      return service.getTeams(event);
    } else if (path.startsWith("/teams/")) {
      return handleTeamOperations(method, event);
    }
  }
}

function handleTeamOperations(method: string, event: APIGatewayProxyEventV2) {
  if (method.toLowerCase() === "get") {
    return service.getTeam(event);
  } else if (method.toLowerCase() === "put") {
    return service.editTeam(event);
  } else if (method.toLowerCase() === "delete") {
    return service.deleteTeam(event);
  }
}

function handleAddPlayerRoute(method: string, event: APIGatewayProxyEventV2) {
  if (method.toLowerCase() === "post") {
    return service.addPlayer(event);
  }
}
