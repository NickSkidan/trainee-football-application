import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { TeamService } from "../services/team-service";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";

const service = container.resolve(TeamService);

export const CreateTeam = middy((event: APIGatewayProxyEventV2) => {
  return service.createTeam(event);
}).use(bodyParser());

export const GetAllTeams = middy((event: APIGatewayProxyEventV2) => {
  return service.getTeams(event);
}).use(bodyParser());

export const TeamProfile = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();

  if (httpMethod === "get") {
    return service.getTeam(event);
  } else if (httpMethod === "put") {
    return service.editTeam(event);
  } else if (httpMethod === "delete") {
    return service.deleteTeam(event);
  } else {
    return service.ResponseWithError(event);
  }
}).use(bodyParser());

export const AddPlayer = middy((event: APIGatewayProxyEventV2) => {
  return service.addPlayer(event);
}).use(bodyParser());
