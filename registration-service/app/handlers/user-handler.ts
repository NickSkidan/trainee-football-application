import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserService } from "../services/user-service";
import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { container } from "tsyringe";

const service = container.resolve(UserService);

export const Registration = middy((event: APIGatewayProxyEventV2) => {
  return service.createUser(event);
}).use(bodyParser());

export const Login = middy((event: APIGatewayProxyEventV2) => {
  return service.loginUser(event);
}).use(bodyParser());

export const Verify = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();

  if (httpMethod === "post") {
    return service.verifyUser(event);
  } else if (httpMethod === "get") {
    return service.getVerificationToken(event);
  } else {
    return service.ResponseWithError(event);
  }
}).use(bodyParser());

export const Profile = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();

  if (httpMethod === "get") {
    return service.getProfile(event);
  } else if (httpMethod === "put") {
    return service.editProfile(event);
  } else if (httpMethod === "post") {
    return service.createProfile(event);
  } else {
    return service.ResponseWithError(event);
  }
}).use(bodyParser());
