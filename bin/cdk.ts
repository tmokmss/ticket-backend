#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CicdBackendStack } from '../lib/stack/cicd-backend';
import { CognitoStack } from '../lib/stack/cognito';
import { StorageStack } from '../lib/stack/storage';
import { TicketServiceStack } from '../lib/stack/ticket-service';

const prefix = 'Octank'
const app = new cdk.App();

new CicdBackendStack(app, prefix + 'CicdBackendStack');

const cognito = new CognitoStack(app, 'CognitoStack');
const storage = new StorageStack(app, 'StorageStack');
const ticket = new TicketServiceStack(app, 'TicketServiceStack', {
    cognito,
    storage,
});
