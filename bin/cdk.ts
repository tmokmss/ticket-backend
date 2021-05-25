#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CicdBackendStack } from '../lib/stack/cicd-backend';
import { CicdMobileStack } from '../lib/stack/cicd-mobile';
import { CognitoStack } from '../lib/stack/cognito';
import { StorageStack } from '../lib/stack/storage';
import { TicketServiceStack } from '../lib/stack/ticket-service';

const prefix = 'Octank'
const app = new cdk.App();

new CicdBackendStack(app, prefix + 'CicdBackendStack');

import * as cd from "aws-cdk"
const s =  async () => {
const aa = await cd.SdkProvider.withAwsCliCompatibleDefaults()
aa.defaultRegion
}

// const region = "ap-northeast-1";
const region = undefined;
const cognito = new CognitoStack(app, 'CognitoStack', {env:{region}});
const storage = new StorageStack(app, 'StorageStack', {env:{region}});
const ticket = new TicketServiceStack(app, 'TicketServiceStack', {
    cognito,
    storage,
    env:{region}
});

new CicdMobileStack(app, 'CicdMobileStack');
