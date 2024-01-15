import * as cdk from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Topic, SubscriptionFilter } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ApiGatewayStack } from "./api-gateway-stack";
import { ServiceStack } from "./service-stack";

export class TransferServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const transferQueue = new Queue(this, "transfer_queue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const transferTopic = Topic.fromTopicArn(
      this,
      "transfer-consume-topic",
      cdk.Fn.importValue("transfer-topic")
    );

    transferTopic.addSubscription(
      new SqsSubscription(transferQueue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({
            allowlist: ["processTransfer"],
          }),
        },
      })
    );

    const { createTransfer, getTransfer, getTransfers } = new ServiceStack(
      this,
      "transfer-service",
      {}
    );
    createTransfer.addEventSource(new SqsEventSource(transferQueue));

    new ApiGatewayStack(this, "transfer-api-gateway", {
      createTransfer,
      getTransfer,
      getTransfers,
    });
  }
}
