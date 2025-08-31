#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { CstSmartDeskStack } = require('./stack');

const app = new cdk.App();
new CstSmartDeskStack(app, 'CstSmartDeskStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});