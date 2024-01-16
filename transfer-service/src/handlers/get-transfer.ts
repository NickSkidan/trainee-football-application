import { APIGatewayEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { DBOperation } from "./db-operation";

export const getTransfersHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const dbOperation = new DBOperation();
    const queryString = "SELECT * FROM transfers LIMIT 500";
    const result = await dbOperation.executeQuery(queryString, []);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          statusCode: 201,
          body: JSON.stringify({ transfers: result.rows[0] }),
        };
      }
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "transfers not found" }),
    };
  }
).use(jsonBodyParser());

export const getTransferHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const dbOperation = new DBOperation();
    const { id } = event.pathParameters as any;
    const queryString = "SELECT * FROM transfers WHERE user_id=$1";
    const result = await dbOperation.executeQuery(queryString, [id]);
    if (result.rowCount) {
      if (result.rowCount > 0) {
        return {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          statusCode: 201,
          body: JSON.stringify({ transfer: result.rows }),
        };
      }
    }
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      statusCode: 404,
      body: JSON.stringify({ message: "transfers not found" }),
    };
  }
).use(jsonBodyParser());
