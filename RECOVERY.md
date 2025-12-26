# CST SmartDesk – Recovery & Authority Manifest

## Source of Truth
- Branch: restore-premium
- Tag: CST-GOLD-BASELINE-UI
- Lock file: BASELINE.lock

## Deployment
- S3 bucket: cst-smartdesk-app-1756806160
- CloudFront ID: EO1QOG55DBB10

## Build Flow
1. Edit files in repo
2. npm run build
3. Upload dist/ to S3
4. CloudFront invalidation

## NEVER DO
- Edit files directly in S3
- Rebuild from unknown folders
- Mix old buckets

## If UI breaks
1. git status (must be clean)
2. npm run build
3. Compare dist/ vs S3
4. Invalidate CloudFront
