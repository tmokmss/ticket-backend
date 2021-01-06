import * as cdk from '@aws-cdk/core';
import * as gw from '@aws-cdk/aws-apigateway';
import * as lambdanode from '@aws-cdk/aws-lambda-nodejs';
import { CognitoStack } from './cognito';
import { CognitoAuthorizer } from '../construct/cognito-authorizer';
import { StorageStack } from './storage';

export interface TicketServiceStackProps extends cdk.StackProps {
    cognito: CognitoStack,
    storage: StorageStack,
}

export class TicketServiceStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: TicketServiceStackProps) {
        super(scope, id, props);

        const api = new gw.RestApi(this, 'api', {
            restApiName: 'Travel Backend',
        });

        const auth = new CognitoAuthorizer(this, 'authorizer', {
            authorizerName: "CognitoAuthorizer",
            identitySource: "method.request.header.Authorization",
            userPoolArn: props.cognito.userPool.userPoolArn,
        });

        {
            const handler = new lambdanode.NodejsFunction(this, 'handler', {
                entry: 'backend/ticket/main.ts',
                handler: 'lambdaHandler',
                depsLockFilePath: 'backend/ticket/package-lock.json',
                bundling: {
                    minify: false,
                    tsconfig: 'backend/ticket/tsconfig.json',
                    nodeModules: [
                        "aws-serverless-express",
                        "express",
                    ],
                },
                environment: {
                    "TICKET_TABLE_NAME": props.storage.ticketTable.tableName,
                }
            });

            props.storage.ticketTable.grantReadWriteData(handler);

            const integration = new gw.LambdaIntegration(handler);
            const tickets = api.root.addResource('tickets', {
                defaultIntegration: integration,
                defaultCorsPreflightOptions: {
                    allowOrigins: gw.Cors.ALL_ORIGINS,
                    allowMethods: gw.Cors.ALL_METHODS,
                },
                
            });

            tickets.addProxy({
                defaultIntegration: integration,
                defaultMethodOptions: {
                    authorizationType: gw.AuthorizationType.COGNITO,
                    authorizer: auth,
                    authorizationScopes: [
                        "api/ticket",
                    ],
                }
            });
        }
    }
}
