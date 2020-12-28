import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as gw from '@aws-cdk/aws-apigateway';
import * as lambdanode from '@aws-cdk/aws-lambda-nodejs';
import { GenericWindowsImage } from '@aws-cdk/aws-ec2';

export interface TicketServiceStackProps extends cdk.StackProps {
}

export class TicketServiceStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: TicketServiceStackProps) {
        super(scope, id, props);

        const handler = new lambdanode.NodejsFunction(this, 'handler', {
            entry: 'backend/ticket/main.ts',
            handler: 'lambdaHandler',

        })
        const integration = new gw.LambdaIntegration(handler);

        const api = new gw.RestApi(this, 'api', {
            restApiName: 'octankTravel'
        });
        
        const tickets = api.root.addResource('tickets', {
            defaultIntegration: integration,
            defaultCorsPreflightOptions: {
                allowOrigins: gw.Cors.ALL_ORIGINS,
                allowMethods: gw.Cors.ALL_METHODS,
            }
        });

        // new gw.LambdaRestApi(this, 'gw', {
        //     handler: handler,
        // })
    }
}
