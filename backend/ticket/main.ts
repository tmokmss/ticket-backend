import * as express from "aws-serverless-express";
import * as middleware from 'aws-serverless-express/middleware';
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { app } from "./app"

app.use(middleware.eventContext());
const server = express.createServer(app);

export const lambdaHandler = (
    event: APIGatewayProxyEvent,
    context: Context
) => {
    express.proxy(server, event, context);
}
