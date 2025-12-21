# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-08-31

### Added - AWS infra + perf

- **AWS Infrastructure**: Complete CDK stack with S3, CloudFront, API Gateway, Lambda
- **Security Headers**: Strict CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff
- **Performance Optimization**: Tiered caching (no-store HTML, 1yr assets, 1hr app.js, no-cache API)
- **Origin Access Control**: Private S3 bucket with CloudFront OAC
- **TypeScript CDK**: Full TypeScript implementation with proper typing
- **Lambda Functions**: Node.js 18 handlers for /api/fetch and /api/copilot endpoints
- **Deployment Scripts**: Automated sync, invalidation, and URL retrieval
- **Cache Behaviors**: Optimized cache policies for different content types

### Infrastructure Components

- S3 bucket with private access and OAC
- CloudFront distribution with security headers
- API Gateway with CORS support
- Lambda functions with proper error handling
- Automated deployment and sync scripts

### Performance Features

- Immutable asset caching (365 days)
- Short-lived app.js caching (1 hour)
- No-cache API responses
- No-store HTML for dynamic content
