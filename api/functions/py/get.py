import json
from lib.book import Book
import os
import boto3
from mypy_boto3_dynamodb import DynamoDBClient
from boto3.dynamodb.types import TypeDeserializer


def handler(event, context):
    path = event["pathParameters"]
    id = path["id"]

    table_name = os.getenv("TABLE_NAME")
    dynamodb: DynamoDBClient = boto3.client("dynamodb")

    resp = dynamodb.get_item(
        TableName=table_name,
        Key=id,
    )

    item = resp.get("Item")
    if not item:
        return {
            "isBase64Encoded": False,
            "statusCode": 404,
            "headers": {
                "Content-Type": "application/json",
            },
            "multiValueHeaders": {},
            "body": json.dumps({"error": "item was not found"}),
        }

    deser = TypeDeserializer()
    item_deserialized = {k: deser.deserialize(v) for k, v in item.items()}
    book = Book.parse_obj(item_deserialized)

    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
        },
        "multiValueHeaders": {},
        "body": json.dumps(book),
    }
