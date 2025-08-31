import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class CstSmartdeskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket (private)
    const bucket = new s3.Bucket(this, 'CstSmartdeskBucket', {
      bucketName: `cst-smartdesk-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Origin Access Control
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: 'CST SmartDesk OAC',
    });

    // Response Headers Policy with strict CSP
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
        contentTypeOptions: {
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER,
          override: true,
        },
      },
    });

    // Cache Policies
    const htmlCachePolicy = new cloudfront.CachePolicy(this, 'HtmlCachePolicy', {
      cachePolicyName: 'CST-HTML-NoStore',
      defaultTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(0),
      minTtl: cdk.Duration.seconds(0),
    });

    const assetsCachePolicy = new cloudfront.CachePolicy(this, 'AssetsCachePolicy', {
      cachePolicyName: 'CST-Assets-Immutable',
      defaultTtl: cdk.Duration.days(365),
      maxTtl: cdk.Duration.days(365),
      minTtl: cdk.Duration.days(365),
    });

    const appJsCachePolicy = new cloudfront.CachePolicy(this, 'AppJsCachePolicy', {
      cachePolicyName: 'CST-AppJs-1Hour',
      defaultTtl: cdk.Duration.hours(1),
      maxTtl: cdk.Duration.hours(1),
      minTtl: cdk.Duration.seconds(0),
    });

    // Lambda functions
    const fetchLambda = new lambda.Function(this, 'FetchLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../infra/src/lambdas', {
        bundling: {
          image: lambda.Runtime.NODEJS_18_X.bundlingImage,
          command: ['cp', '/asset-input/fetch.ts', '/asset-output/index.js'],
        },
      }),
    });

    const copilotLambda = new lambda.Function(this, 'CopilotLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../infra/src/lambdas', {
        bundling: {
          image: lambda.Runtime.NODEJS_18_X.bundlingImage,
          command: ['cp', '/asset-input/copilot.ts', '/asset-output/index.js'],
        },
      }),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'CstSmartdeskApi', {
      restApiName: 'CST SmartDesk API',
      description: 'API for CST SmartDesk application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const apiResource = api.root.addResource('api');
    apiResource.addResource('fetch').addMethod('GET', new apigateway.LambdaIntegration(fetchLambda));
    apiResource.addResource('copilot').addMethod('POST', new apigateway.LambdaIntegration(copilotLambda));

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'CstSmartdeskDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, { originAccessControl: oac }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: htmlCachePolicy,
        responseHeadersPolicy,
      },
      additionalBehaviors: {
        '/assets/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, { originAccessControl: oac }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: assetsCachePolicy,
          responseHeadersPolicy,
        },
        '/app.js': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, { originAccessControl: oac }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: appJsCachePolicy,
          responseHeadersPolicy,
        },
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

    // Grant CloudFront access to S3
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [new cdk.aws_iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Deploy static assets
    new s3deploy.BucketDeployment(this, 'CstSmartdeskDeployment', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.domainName}`,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}