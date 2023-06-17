import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as pylambda from "@aws-cdk/aws-lambda-python-alpha";
import * as golambda from "@aws-cdk/aws-lambda-go-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Table to store data
    const table = new dynamodb.Table(this, "Table", {
      tableName: "book-table",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda functions
    const createFn = new pylambda.PythonFunction(this, "CreateLambda", {
      entry: "functions/py",
      runtime: lambda.Runtime.PYTHON_3_10,
      index: "create.py",
      functionName: "create-book",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantWriteData(createFn);

    const getFn = new pylambda.PythonFunction(this, "GetLambda", {
      entry: "functions/py",
      runtime: lambda.Runtime.PYTHON_3_10,
      index: "get.py",
      functionName: "get-book",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(getFn);

    const authFn = new golambda.GoFunction(this, "AuthLambda", {
      entry: "functions/go/cmd/auth",
      functionName: "auth",
    });

    // API Gateway
    const api = new apigateway.RestApi(this, "ApiGateway", {
      restApiName: "book-api",
    });

    // Authorizer
    const authorizer = new apigateway.RequestAuthorizer(this, "Authorizer", {
      authorizerName: "auth",
      handler: authFn,
      identitySources: [apigateway.IdentitySource.header("Authorization")],
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    // /books endpoints
    const books = api.root.addResource("books");

    // POST /books
    books.addMethod("POST", new apigateway.LambdaIntegration(createFn), {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    // GET /books/{id}
    books.addMethod("GET", new apigateway.LambdaIntegration(getFn), {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }
}
