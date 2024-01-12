import { APIGatewayProxyEventV2 } from "aws-lambda";
import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { container } from "tsyringe";
import { PlayerService } from "../services/player-service";

const service = container.resolve(PlayerService);

export const CreatePlayer = middy((event: APIGatewayProxyEventV2) => {
  return service.createPlayer(event);
}).use(bodyParser());

export const GetAllPlayers = middy((event: APIGatewayProxyEventV2) => {
  return service.getPlayers(event);
}).use(bodyParser());

export const PlayerProfile = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();

  if (httpMethod === "get") {
    return service.getPlayer(event);
  } else if (httpMethod === "put") {
    return service.editPlayer(event);
  } else if (httpMethod === "delete") {
    return service.deletePlayer(event);
  } else {
    return service.ResponseWithError(event);
  }
}).use(bodyParser());

export const JoinTeam = middy((event: APIGatewayProxyEventV2) => {
  return service.joinTeam(event);
}).use(bodyParser());
