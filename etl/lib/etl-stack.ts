import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as pylambda from "@aws-cdk/aws-lambda-python-alpha";

export class EtlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket to store data
    const dataBucket = new s3.Bucket(this, "DataBucket", {
      bucketName: "etl-data-bucket",
    });

    // Lambda functions
    const extractFn = new pylambda.PythonFunction(this, "ExtractFn", {
      entry: "functions/py",
      runtime: lambda.Runtime.PYTHON_3_10,
      index: "extract.py",
      functionName: "extract",
    });
    dataBucket.grantRead(extractFn);

    const transformFn = new pylambda.PythonFunction(this, "TransformFn", {
      entry: "functions/py",
      runtime: lambda.Runtime.PYTHON_3_10,
      index: "transform.py",
      functionName: "transform",
    });
    dataBucket.grantReadWrite(transformFn);

    const loadFn = new pylambda.PythonFunction(this, "LoadFn", {
      entry: "functions/py",
      runtime: lambda.Runtime.PYTHON_3_10,
      index: "load.py",
      functionName: "load",
    });
    dataBucket.grantReadWrite(loadFn);

    // Step function
    const startState = new sfn.Pass(this, "StartState");

    const extractState = new tasks.LambdaInvoke(this, "ExtractState", {
      lambdaFunction: extractFn,
      outputPath: "$.Extract",
    });

    const transformState = new tasks.LambdaInvoke(this, "TransformState", {
      lambdaFunction: transformFn,
      payload: sfn.TaskInput.fromJsonPathAt("$.Extract"),
      outputPath: "$.Transform",
    });

    const loadState = new tasks.LambdaInvoke(this, "LoadState", {
      lambdaFunction: loadFn,
      payload: sfn.TaskInput.fromJsonPathAt("$.Transform"),
      outputPath: "$.Load",
    });

    const finalState = new sfn.Pass(this, "FinalState", {
      inputPath: "$.Load",
    });

    const definition = startState
      .next(extractState)
      .next(transformState)
      .next(loadState)
      .next(finalState);

    const stateMachine = new sfn.StateMachine(this, "StateMachine", {
      stateMachineName: "etl",
      definition: definition,
    });
  }
}
