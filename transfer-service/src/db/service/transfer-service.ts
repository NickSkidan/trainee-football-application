import { TransferRepository } from "../repository/transfer-repository";
import { APIGatewayEvent, SQSEvent, SQSRecord } from "aws-lambda";
import { plainToClass } from "class-transformer";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { RawTransferInput } from "../../dto/input";
import { ValidateError } from "../../utilities/errors";
import { ErrorResponse, SuccessResponse } from "../../utilities/response";

export class TransferService {
  private transferRepository!: TransferRepository;

  constructor(transferRepository: TransferRepository) {
    this.transferRepository = transferRepository;
  }

  async handleSqsMessageAndCreateTransfer(event: SQSEvent) {
    const transferResponse: Record<string, unknown>[] = [];
    const sqsClient = new SQSClient();

    const promises = event.Records.map(async (record: SQSRecord) => {
      const input = plainToClass(RawTransferInput, JSON.parse(record.body));
      const errors = await ValidateError(input);

      console.log("ERRORS:", JSON.stringify(errors));

      if (!errors) {
        const data = await this.transferRepository.createTransfer(input);
        await this.deleteMessageFromQueue(record, sqsClient);
      } else {
        transferResponse.push({ error: JSON.stringify(errors) });
      }
    });

    await Promise.all(promises);
    console.log("RESPONSE:", transferResponse);
    return SuccessResponse(transferResponse);
  }

  async getTransfer(event: APIGatewayEvent) {
    try {
      const { id } = event.pathParameters as any;
      const data = await this.transferRepository.getTransferByUserId(id);
      if (!data) return ErrorResponse(404, "transfers not found");
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getTransfers(event: APIGatewayEvent) {
    try {
      const data = await this.transferRepository.getAllTransfers();
      if (!data) return ErrorResponse(404, "transfers not found");
      return SuccessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  deleteMessageFromQueue = async (record: SQSRecord, sqsClient: SQSClient) => {
    const arnParts = record.eventSourceARN.split(":");
    const region = arnParts[3];
    const accountId = arnParts[4];
    const queueName = arnParts[5].split("/").pop() || "";

    const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

    const params = {
      QueueUrl: queueUrl,
      ReceiptHandle: record.receiptHandle,
    };

    try {
      await sqsClient.send(new DeleteMessageCommand(params));
      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message from SQS:", error);
      throw error;
    }
  };
}
