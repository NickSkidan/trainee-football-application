import { SQSEvent, SQSRecord } from "aws-lambda";
import { plainToClass } from "class-transformer";
import { ValidateError } from "../utilities/errors";
import { RawTransferInput } from "../dto/input";
import { DBOperation } from "./db-operation";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";

export const createTransferHandler = async (event: SQSEvent) => {
  const transferResponse: Record<string, unknown>[] = [];
  const dbOperation = new DBOperation();
  const sqsClient = new SQSClient();

  const promisses = event.Records.map(async (record: SQSRecord) => {
    const input = plainToClass(RawTransferInput, JSON.parse(record.body));
    const errors = await ValidateError(input);

    console.log("ERRORS:", JSON.stringify(errors));

    if (!errors) {
      const transferValues = [
        input.userId,
        input.playerId,
        input.previousTeamId,
        input.currentTeamId,
        input.playerPrice,
      ];
      const transferQuery = `INSERT INTO transfers(
        user_id,
        player_id,
        previous_team_id,
        current_team_id,
        player_price
         )
        VALUES($1,$2,$3,$4,$5) RETURNING *`;
      const transferResult = await dbOperation.executeQuery(
        transferQuery,
        transferValues
      );

      await deleteMessageFromQueue(record, sqsClient);
    } else {
      transferResponse.push({ error: JSON.stringify(errors) });
    }
  });

  await Promise.all(promisses);
  console.log("RESPONSE:", transferResponse);
  return { statusCode: 200, body: transferResponse };
};

const deleteMessageFromQueue = async (
  record: SQSRecord,
  sqsClient: SQSClient
) => {
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
