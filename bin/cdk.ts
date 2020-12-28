#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CognitoStack } from '../lib/stack/cognito';

import { NetworkStack } from '../lib/stack/network';
import { TicketServiceStack } from '../lib/stack/ticket-service';

const prefix = 'Octank'
const app = new cdk.App();

const vpc = new NetworkStack(app, prefix + 'NetworkStack');

const cognito = new CognitoStack(app, prefix + 'CognitoStack');
const ticket = new TicketServiceStack(app, prefix + 'TicketServiceStack');