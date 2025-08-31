# CST SmartDesk - Deployment Guide

## 🚀 Quick Deployment

Your CST SmartDesk application is **already deployed** and ready for use!

### Current Deployment Status
- ✅ **Deployed to**: AWS S3 (Private Bucket)
- ✅ **Bucket Name**: `cst-smartdesk-app-1756634334`
- ✅ **Access Method**: Pre-signed URLs (24-hour expiry)
- ✅ **Security**: Private access with temporary signed links

## 🔗 Access Your Application

### Method 1: Use the Access Script
```bash
cd /Users/jesusariza/Documents/GitHub1/cst-smartdeskapp
./access-app.sh
```

### Method 2: Manual AWS CLI
```bash
aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 86400
```

### Method 3: Generate New Links
```bash
# 24-hour access (recommended)
aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 86400

# 1-hour access (high security)
aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 3600

# 1-week access (team sharing)
aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 604800
```

## 🔄 Update Deployment

### Update Application Files
```bash
# Build latest version
npm run build

# Deploy to S3
aws s3 sync dist/ s3://cst-smartdesk-app-1756634334/ --delete

# Generate new access link
./access-app.sh
```

### Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh - Complete deployment script

echo "🚀 Deploying CST SmartDesk..."

# Build application
echo "📦 Building application..."
npm run build

# Deploy to S3
echo "☁️ Uploading to S3..."
aws s3 sync dist/ s3://cst-smartdesk-app-1756634334/ --delete

# Generate access link
echo "🔗 Generating access link..."
ACCESS_URL=$(aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 86400)

echo "✅ Deployment complete!"
echo "🔗 Access URL: $ACCESS_URL"
echo "⏰ Link expires in 24 hours"
```

## 🔒 Security Configuration

### Current Security Settings
- **Public Access**: ❌ Blocked (all public access disabled)
- **Bucket Policy**: ❌ Removed (no public read permissions)
- **Access Method**: ✅ Pre-signed URLs only
- **Link Expiry**: ✅ 24-hour default (configurable)

### Verify Security Status
```bash
# Check public access block
aws s3api get-public-access-block --bucket cst-smartdesk-app-1756634334

# Verify no bucket policy exists
aws s3api get-bucket-policy --bucket cst-smartdesk-app-1756634334
```

## 🌐 Advanced Deployment Options

### Option 1: CloudFront Distribution (Recommended)
```bash
# Create CloudFront distribution for better performance
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Option 2: Custom Domain Setup
```bash
# Set up Route 53 hosted zone
aws route53 create-hosted-zone --name cst-smartdesk.internal --caller-reference $(date +%s)

# Create SSL certificate
aws acm request-certificate --domain-name cst-smartdesk.internal
```

### Option 3: Load Balancer + EC2 (Enterprise)
```bash
# For high-availability deployment
aws ec2 create-launch-template --launch-template-name cst-smartdesk-template
aws elbv2 create-load-balancer --name cst-smartdesk-lb
```

## 👥 Team Access Management

### Share Access with Team
```bash
# Generate team access links
for i in {1..5}; do
  echo "Team Member $i:"
  aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 86400
  echo ""
done
```

### Create IAM Users for Team Access
```bash
# Create IAM user for team member
aws iam create-user --user-name cst-team-member-1

# Attach S3 read-only policy
aws iam attach-user-policy \
  --user-name cst-team-member-1 \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Create access keys
aws iam create-access-key --user-name cst-team-member-1
```

## 📊 Monitoring & Analytics

### Enable S3 Access Logging
```bash
# Create logging bucket
aws s3 mb s3://cst-smartdesk-logs-$(date +%s)

# Enable access logging
aws s3api put-bucket-logging \
  --bucket cst-smartdesk-app-1756634334 \
  --bucket-logging-status file://logging-config.json
```

### CloudWatch Monitoring
```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name CST-SmartDesk \
  --dashboard-body file://dashboard-config.json
```

## 🔧 Troubleshooting

### Common Issues

#### Issue: Access Denied Error
```bash
# Solution: Generate new pre-signed URL
aws s3 presign s3://cst-smartdesk-app-1756634334/index.html --expires-in 86400
```

#### Issue: Files Not Loading
```bash
# Solution: Check S3 sync and regenerate
aws s3 sync dist/ s3://cst-smartdesk-app-1756634334/ --delete
```

#### Issue: Expired Links
```bash
# Solution: Links expire after 24 hours, generate new ones
./access-app.sh
```

### Diagnostic Commands
```bash
# Check bucket contents
aws s3 ls s3://cst-smartdesk-app-1756634334/

# Verify file accessibility
aws s3 cp s3://cst-smartdesk-app-1756634334/index.html /tmp/test.html

# Check bucket permissions
aws s3api get-bucket-acl --bucket cst-smartdesk-app-1756634334
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Security scan completed
- [ ] Build process successful
- [ ] Environment variables configured

### Deployment
- [ ] Files uploaded to S3
- [ ] Access links generated
- [ ] Security settings verified
- [ ] Team notified of new deployment

### Post-Deployment
- [ ] Application functionality tested
- [ ] Performance metrics checked
- [ ] Access logs reviewed
- [ ] Backup verification completed

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# Enable S3 versioning for rollback capability
aws s3api put-bucket-versioning \
  --bucket cst-smartdesk-app-1756634334 \
  --versioning-configuration Status=Enabled

# List object versions
aws s3api list-object-versions --bucket cst-smartdesk-app-1756634334

# Restore previous version
aws s3api copy-object \
  --copy-source cst-smartdesk-app-1756634334/index.html?versionId=VERSION_ID \
  --bucket cst-smartdesk-app-1756634334 \
  --key index.html
```

### Security Incident Response
```bash
# Immediately disable all access
aws s3api put-public-access-block \
  --bucket cst-smartdesk-app-1756634334 \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Revoke all existing pre-signed URLs (they'll expire naturally)
# Generate new secure access links as needed
```

## 📞 Support Contacts

**Primary Maintainer**: Jesus Ariza  
**Email**: [your-email@asurion.com]  
**Phone**: [your-phone-number]

**AWS Account**: [Your AWS Account ID]  
**Region**: us-east-1 (or your configured region)

---

*Last Updated: December 2024*  
*Version: 1.0.0*