import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { NetworkStack } from './network';

export interface CognitoStackProps extends cdk.StackProps {
}

export class CognitoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: CognitoStackProps) {
        super(scope, id, props);
        const userPool = new cognito.UserPool(this, 'userPool', {
            passwordPolicy: {
                requireUppercase: false,
                requireSymbols: false,
                requireDigits: false,
            },
            selfSignUpEnabled: true,
            signInAliases: {
                username: false,
                email: true
            },
        });

        userPool.addClient(`mobileClient`, {

        })

        // new cognito.CfnUserPoolGroup(this, 'admin-group', {
        //     userPoolId: userPool.userPoolId,
        //     groupName: 'admin',
        // })
    }
}
