package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type Event events.APIGatewayCustomAuthorizerRequestTypeRequest
type Response events.APIGatewayCustomAuthorizerResponse

func Handler(ctx context.Context, event Event) (*Response, error) {
	log.Println("Authorized!")

	return &Response{
		PrincipalID: "User",
		PolicyDocument: events.APIGatewayCustomAuthorizerPolicy{
			Version: "2012-10-17",
			Statement: []events.IAMPolicyStatement{
				{
					Effect:   "Allow",
					Action:   []string{"execute-api:Invoke"},
					Resource: []string{event.MethodArn},
				},
			},
		},
		Context:            map[string]interface{}{},
		UsageIdentifierKey: "",
	}, nil
}

func main() {
	lambda.Start(Handler)
}
