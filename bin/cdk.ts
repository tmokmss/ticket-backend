#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CicdBackendStack } from '../lib/stack/cicd-backend';

const prefix = 'Octank'
const app = new cdk.App();

new CicdBackendStack(app, prefix + 'CicdBackendStack');
