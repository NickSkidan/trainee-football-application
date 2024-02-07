import { APIGatewayProxyEventV2 } from "aws-lambda";
import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { container } from "tsyringe";
import { PlayerService } from "../db/services/player-service";

const service = container.resolve(PlayerService);

export const PlayerHandler = middy((event: APIGatewayProxyEventV2) => {
  const { path, method } = event.requestContext.http;

  switch (true) {
    case path.startsWith("/players"):
      return handlePlayersRoute(path, method, event);

    case path.startsWith("/joinTeam/"):
      return handleJoinTeamRoute(method, event);

    default:
      return service.ResponseWithError();
  }
}).use(bodyParser());

function handlePlayersRoute(
  path: string,
  method: string,
  event: APIGatewayProxyEventV2
) {
  if (method.toLowerCase() === "post") {
    return service.createPlayer(event);
  } else if (method.toLowerCase() === "get") {
    if (path === "/players") {
      return service.getPlayers(event);
    } else if (path.startsWith("/players/")) {
      return handlePlayerOperations(method, event);
    }
  }
}

function handlePlayerOperations(method: string, event: APIGatewayProxyEventV2) {
  if (method.toLowerCase() === "get") {
    return service.getPlayer(event);
  } else if (method.toLowerCase() === "put") {
    return service.editPlayer(event);
  } else if (method.toLowerCase() === "delete") {
    return service.deletePlayer(event);
  }
}

function handleJoinTeamRoute(method: string, event: APIGatewayProxyEventV2) {
  if (method.toLowerCase() === "post") {
    return service.joinTeam(event);
  }
}
