# CST SmartDesk Deployment Guide

## AWS Infrastructure

This project uses AWS CDK to deploy a complete serverless infrastructure:

- **S3 Bucket**: Private bucket with CloudFront OAC
- **CloudFront**: CDN with strict security headers and cache policies
- **API Gateway**: REST API for backend endpoints
- **Lambda Functions**: Node.js 18 functions for /api/fetch and /api/copilot

## Security Features

- **Content Security Policy**: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: no-referrer

## Cache Policies

- **HTML files**: no-store (always fresh)
- **Assets (/assets/*)**: 1 year immutable cache
- **App.js**: 1 hour cache
- **API (/api/*)**: no cache

## Deployment Commands

```bash
# Build and deploy infrastructure
npm run aws:build
npm run aws:deploy

# Sync files and invalidate cache
npm run aws:sync
npm run aws:invalidate

# Get CloudFront URL
npm run aws:url
```

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 20.x
- CDK bootstrapped in target region

## Directory Structure

```text
infra/
├── bin/cst-smartdesk.ts     # CDK app entry point
├── lib/cst-smartdesk-stack.ts # Main stack definition
├── src/lambdas/
│   ├── fetch.ts             # GET /api/fetch handler
│   └── copilot.ts           # POST /api/copilot handler
├── package.json             # CDK dependencies
├── tsconfig.json            # TypeScript config
└── cdk.json                 # CDK configuration
```
