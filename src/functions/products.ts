import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "products";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    let _routeKey = `${event.httpMethod} ${event.resource}`
    switch (_routeKey) {
      case "DELETE /product/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event?.pathParameters?.id,
            },
          })
        );
        body = `Deleted item ${event?.pathParameters?.id}`;
        break;
      case "GET /product/{id}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event?.pathParameters?.id,
            },
          })
        );
        body = body.Item;
        break;
      case "GET /products":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName, Limit: 100 })
        );
        body = body.Items;
        break;
      case "PUT /product":
        let _reqPut = JSON.parse(event?.body || '');
        let _itemId = uuidv4()
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: _itemId,
              price: _reqPut.price,
              name: _reqPut.name,
            },
          })
        );
        body = `Put item ${_itemId}`;
        break;
      case "PATCH /product/{id}":
        let _reqPatch = JSON.parse(event?.body || '');
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: event?.pathParameters?.id,
              price: _reqPatch.price,
              name: _reqPatch.name,
            },
          })
        );
        body = `Updated item ${event?.pathParameters?.id}`;
        break;
      default:
        // body =  JSON.stringify(event);
        throw new Error(`Unsupported route swag: "${_routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};