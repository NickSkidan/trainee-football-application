import { SQSEvent } from "aws-lambda";
import { APIGatewayEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import { TransferService } from "../db/service/transfer-service";
import { TransferRepository } from "../db/repository/transfer-repository";

// tsyringe lib is not working for some reasons
const transferRepository = new TransferRepository();
const service = new TransferService(transferRepository);

export const createTransferHandler = async (event: SQSEvent) => {
  return service.handleSqsMessageAndCreateTransfer(event);
};

export const getTransfersHandler = middy(
  async (event: APIGatewayEvent, context: Context) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return service.getTransfers(event);
  }
);

export const getTransferHandler = middy(
  async (event: APIGatewayEvent, context: Context) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return service.getTransfer(event);
  }
);
