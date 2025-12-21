#!/bin/bash

echo "DEPRECATED. Use: npm run deploy (aws-sync.mjs locked to cst-smartdesk-app-1756806160)"
exit 1

# CST SmartDesk - Deploy 16 Smart Panels Update

echo "🚀 Deploying 16 Smart Panels to AWS..."

# Build the application
echo "📦 Building application..."
npm run build

# Sync to S3
echo "☁️ Syncing to S3..."
aws s3 sync dist/ s3://cst-smartdesk-782683897569-us-east-1 --delete --exact-timestamps

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $(aws cloudformation describe-stacks --stack-name CstSmartDeskStack --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' --output text) --paths '/*'

# Get CloudFront URL
echo "🌐 Live site URL:"
aws cloudformation describe-stacks --stack-name CstSmartDeskStack --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text

echo "✅ Deployment complete! All 16 smart panels are now live."
