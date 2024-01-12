import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic, SubscriptionFilter } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { join } from "path";

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

    // handler
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
    };

    const createTransferHandler = new NodejsFunction(
      this,
      "create-transfer-handler",
      {
        entry: join(__dirname, "/../src/transfer/create.ts"),
        ...nodeJsFunctionProps,
      }
    );

    createTransferHandler.addEventSource(new SqsEventSource(transferQueue));
  }
}
