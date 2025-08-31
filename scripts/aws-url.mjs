import fs from 'fs';

const outputsFile = 'infra/cdk-outputs.json';

if (!fs.existsSync(outputsFile)) {
  console.error('❌ CDK outputs file not found. Run aws:deploy first.');
  process.exit(1);
}

const outputs = JSON.parse(fs.readFileSync(outputsFile, 'utf8'));
const cloudFrontUrl = outputs.CstSmartdeskStack?.CloudFrontUrl;

if (!cloudFrontUrl) {
  console.error('❌ CloudFront URL not found in CDK outputs');
  process.exit(1);
}

console.log('🌐 CloudFront URL:');
console.log(cloudFrontUrl);