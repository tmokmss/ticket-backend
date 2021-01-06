import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb';

export interface StorageStackProps extends cdk.StackProps {
}

export class StorageStack extends cdk.Stack {
    readonly ticketTable: dynamo.Table;

    constructor(scope: cdk.Construct, id: string, props?: StorageStackProps) {
        super(scope, id, props);

        const ticketTable = new dynamo.Table(this, 'ticketTable', {
            partitionKey: { name: 'userId', type: dynamo.AttributeType.STRING },
            sortKey: { name: 'boughtAt', type: dynamo.AttributeType.NUMBER },
            billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
        });

        this.ticketTable = ticketTable;
    }
}
