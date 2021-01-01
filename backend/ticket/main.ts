import * as express from "aws-serverless-express";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { app } from "./app"

const server = express.createServer(app);

export const lambdaHandler = (
    event: APIGatewayProxyEvent,
    context: Context
) => {
    express.proxy(server, event, context);
}
