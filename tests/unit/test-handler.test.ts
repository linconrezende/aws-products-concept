import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../src/functions/products";

describe('Unit test for app handler', function () {
    it('verifies successful response', async () => {
        const event: APIGatewayProxyEvent = {
            body: "",
            resource: "/products",
            path: "/products",
            httpMethod: 'GET',
            queryStringParameters: {},
        } as any
        const result = await handler(event)
        console.log(result.body)
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(`Queries: ${JSON.stringify(event.queryStringParameters)}`);
    });
});