import fs from 'fs';
import { spawnSync } from 'child_process';

const outputsFile = 'infra/cdk-outputs.json';

if (!fs.existsSync(outputsFile)) {
  console.error('❌ CDK outputs file not found. Run aws:deploy first.');
  process.exit(1);
}

const outputs = JSON.parse(fs.readFileSync(outputsFile, 'utf8'));
const bucketName = outputs.CstSmartdeskStack?.BucketName;

if (!bucketName) {
  console.error('❌ Bucket name not found in CDK outputs');
  process.exit(1);
}

console.log(`🚀 Syncing dist/ to s3://${bucketName}`);

const result = spawnSync('aws', [
  's3', 'sync', 'dist/', `s3://${bucketName}`,
  '--delete', '--exact-timestamps'
], { stdio: 'inherit' });

if (result.status === 0) {
  console.log('✅ Sync complete');
} else {
  console.error('❌ Sync failed');
  process.exit(1);
}