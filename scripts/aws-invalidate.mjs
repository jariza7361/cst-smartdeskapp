import fs from 'fs';
import { spawnSync } from 'child_process';

const outputsFile = 'infra/cdk-outputs.json';

if (!fs.existsSync(outputsFile)) {
  console.error('❌ CDK outputs file not found. Run aws:deploy first.');
  process.exit(1);
}

const outputs = JSON.parse(fs.readFileSync(outputsFile, 'utf8'));
const distributionId = outputs.CstSmartdeskStack?.CloudFrontDistributionId;

if (!distributionId) {
  console.error('❌ Distribution ID not found in CDK outputs');
  process.exit(1);
}

console.log(`🔄 Invalidating CloudFront distribution ${distributionId}`);

const result = spawnSync('aws', [
  'cloudfront', 'create-invalidation',
  '--distribution-id', distributionId,
  '--paths', '/*'
], { stdio: 'inherit' });

if (result.status === 0) {
  console.log('✅ Invalidation created');
} else {
  console.error('❌ Invalidation failed');
  process.exit(1);
}