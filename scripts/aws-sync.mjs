import fs from 'fs';
import { execSync, spawnSync } from 'child_process';

const DEPLOY_BUCKET = 'cst-smartdesk-app-1756806160';
const EXPECTED_ACCOUNT = '782683897569';
const outputsFile = 'infra/cdk-outputs.json';

let bucketName;
if (fs.existsSync(outputsFile)) {
  const outputs = JSON.parse(fs.readFileSync(outputsFile, 'utf8'));
  bucketName = outputs.CstSmartdeskStack?.BucketName;
}

if (bucketName && bucketName !== DEPLOY_BUCKET) {
  throw new Error(`Refusing to deploy. Expected bucket ${DEPLOY_BUCKET} but got ${bucketName}`);
}
bucketName = DEPLOY_BUCKET;

let accountId;
try {
  const ident = JSON.parse(execSync('aws sts get-caller-identity', { encoding: 'utf8' }));
  accountId = ident?.Account;
} catch (error) {
  console.error('❌ Unable to verify AWS account. Is AWS CLI configured?');
  process.exit(1);
}

if (accountId !== EXPECTED_ACCOUNT) {
  throw new Error(`Refusing to deploy. Expected AWS account ${EXPECTED_ACCOUNT} but got ${accountId}`);
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
