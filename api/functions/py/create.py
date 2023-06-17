import json
import os
from lib.book import Book
import boto3
from boto3.dynamodb.types import TypeSerializer
from mypy_boto3_dynamodb import DynamoDBClient


def handler(event, context):
    try:
        book = Book.parse_raw(event["body"])
    except Exception as e:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
            },
            "multiValueHeaders": {},
            "body": json.dumps({"error": "body could not be parsed"}),
        }

    table_name = os.getenv("TABLE_NAME")
    dynamodb: DynamoDBClient = boto3.client("dynamodb")

    ser = TypeSerializer()
    book_serialized = {k: ser.serialize(v) for k, v in book.dict().items()}
    dynamodb.put_item(
        TableName=table_name,
        Item=book_serialized,
    )

    return {
        "isBase64Encoded": False,
        "statusCode": 201,
        "headers": {
            "Content-Type": "application/json",
        },
        "multiValueHeaders": {},
        "body": json.dumps(book_serialized),
    }
