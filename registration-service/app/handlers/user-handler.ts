import { APIGatewayProxyEventV2 } from "aws-lambda";
import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
import { container } from "tsyringe";
import { UserService } from "../db/services/user-service";

const service = container.resolve(UserService);

export const UserHandler = middy((event: APIGatewayProxyEventV2) => {
  const { path, method } = event.requestContext.http;

  switch (path) {
    case "/register":
      if (method.toLowerCase() === "post") {
        return service.createUser(event);
      }
      break;
    case "/login":
      if (method.toLowerCase() === "post") {
        return service.loginUser(event);
      }
      break;
    case "/verify":
      if (method.toLowerCase() === "post") {
        return service.verifyUser(event);
      } else if (method.toLowerCase() === "get") {
        return service.getVerificationToken(event);
      }
      break;
    case "/profile":
      if (method.toLowerCase() === "get") {
        return service.getProfile(event);
      } else if (method.toLowerCase() === "put") {
        return service.editProfile(event);
      } else if (method.toLowerCase() === "post") {
        return service.createProfile(event);
      }
      break;

    default:
      return service.ResponseWithError(event);
  }
}).use(bodyParser());
