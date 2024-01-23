import { APIGatewayEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import { DBOperation } from "./db-operation";
import { CreateTransferInput } from "../dto/input";
import { ErrorResponse, SuccessResponse } from "../utilities/response";

export const getTransfersHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const dbOperation = new DBOperation();
    const queryString = "SELECT * FROM transfers LIMIT 500";
    const result = await dbOperation.executeQuery(queryString, []);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return SuccessResponse(result.rows as CreateTransferInput[]);
      }
    }
    return ErrorResponse(404, "transfers not found");
  }
);

export const getTransferHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const dbOperation = new DBOperation();
    const { id } = event.pathParameters as any;
    const queryString = "SELECT * FROM transfers WHERE user_id=$1";
    const result = await dbOperation.executeQuery(queryString, [id]);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return SuccessResponse(result.rows as CreateTransferInput[]);
      }
    }
    return ErrorResponse(404, "transfers not found");
  }
);
