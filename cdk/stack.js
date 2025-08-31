const { Stack, RemovalPolicy, CfnOutput } = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const lambda = require('aws-cdk-lib/aws-lambda');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');

class CstSmartDeskStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 Bucket for static assets
    const bucket = new s3.Bucket(this, 'CstSmartDeskBucket', {
      bucketName: `cst-smartdesk-${this.account}-${this.region}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda function for API endpoints
    const apiLambda = new lambda.Function(this, 'CstSmartDeskApi', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const path = event.path || event.rawPath;
          
          if (path === '/api/fetch') {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ok: true, message: 'API fetch endpoint working' })
            };
          }
          
          if (path === '/api/copilot') {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ response: 'Copilot API working', timestamp: new Date().toISOString() })
            };
          }
          
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Not found' })
          };
        };
      `),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CstSmartDeskApiGateway', {
      restApiName: 'CST SmartDesk API',
      description: 'API for CST SmartDesk application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const apiIntegration = new apigateway.LambdaIntegration(apiLambda);
    api.root.addResource('api').addProxy({
      defaultIntegration: apiIntegration,
      anyMethod: true,
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'CstSmartDeskDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Deploy static assets
    new s3deploy.BucketDeployment(this, 'CstSmartDeskDeployment', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.domainName}`,
      description: 'CloudFront Distribution URL',
    });

    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

module.exports = { CstSmartDeskStack };