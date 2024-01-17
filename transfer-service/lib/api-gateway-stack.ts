import { aws_apigateway } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayStackProps {
  createTransfer: IFunction;
  getTransfer: IFunction;
  getTransfers: IFunction;
}

interface ResourceType {
  name: string;
  methods: string[];
  child?: ResourceType;
}

export class ApiGatewayStack extends Construct {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id);
    this.addResource("transfer", props);
  }

  addResource(
    serviceName: string,
    { getTransfer, getTransfers }: ApiGatewayStackProps
  ) {
    // transfer
    const apgw = new aws_apigateway.RestApi(this, `${serviceName}-Api`, {
      defaultCorsPreflightOptions: {
        allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
      },
    });

    // transfer Endpoint
    const transferResource = this.createEndpoints(getTransfers, apgw, {
      name: "transfers",
      methods: ["GET"],
    });
    this.addChildEndpoint("{id}", "GET", getTransfer, transferResource);
  }

  createEndpoints(
    handler: IFunction,
    resource: RestApi,
    { name, methods }: ResourceType
  ) {
    const lambdaFunction = new LambdaIntegration(handler);
    const rootResource = resource.root.addResource(name);
    methods.map((item) => {
      rootResource.addMethod(item, lambdaFunction);
    });
    return rootResource;
  }

  addChildEndpoint(
    path: string,
    methodType: string,
    handler: IFunction,
    resource: aws_apigateway.Resource
  ) {
    const lambdaFunction = new LambdaIntegration(handler);
    const childResource = resource.addResource(path);
    childResource.addMethod(methodType, lambdaFunction);
  }
}
