import "reflect-metadata";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import * as iam from "aws-cdk-lib/aws-iam";

interface ServiceProps {}

export class ServiceStack extends Construct {
  public readonly createTransfer: NodejsFunction;
  public readonly getTransfer: NodejsFunction;
  public readonly getTransfers: NodejsFunction;

  constructor(scope: Construct, id: string, props: ServiceProps) {
    super(scope, id);

    const functionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(180),
    };

    const secretsManagerPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["secretsmanager:GetSecretValue"],
      resources: [
        "*",
      ],
    });

    const secretsManagerPolicy = new iam.Policy(this, "SecretsManagerPolicy", {
      statements: [secretsManagerPolicyStatement],
    });

    this.createTransfer = this.createHandlers(
      functionProps,
      "createTransferHandler",
      secretsManagerPolicy
    );
    this.getTransfer = this.createHandlers(
      functionProps,
      "getTransferHandler",
      secretsManagerPolicy
    );
    this.getTransfers = this.createHandlers(
      functionProps,
      "getTransfersHandler",
      secretsManagerPolicy
    );
  }

  createHandlers(
    props: NodejsFunctionProps,
    handler: string,
    policy: iam.Policy
  ): NodejsFunction {
    const lambdaFunction = new NodejsFunction(this, handler, {
      entry: join(__dirname, "/../src/handlers/index.ts"),
      handler: handler,
      ...props,
    });

    lambdaFunction.role?.attachInlinePolicy(policy);

    return lambdaFunction;
  }
}
