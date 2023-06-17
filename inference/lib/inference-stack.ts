import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class InferenceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const predictFn = new lambda.DockerImageFunction(this, "PredictFn", {
      code: lambda.DockerImageCode.fromImageAsset("functions/predict"),
      memorySize: 4096,
      timeout: cdk.Duration.seconds(15),
    });
  }
}
