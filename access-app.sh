#!/bin/bash
# CST SmartDesk Access Script
# Usage: ./access-app.sh

echo "🚀 CST SmartDesk - Generating Access Link..."

# Generate 24-hour access link
ACCESS_URL=$(aws s3 presign s3://cst-smartdesk-app-1756806160/index.html --expires-in 86400)

echo "✅ Access link generated (expires in 24 hours):"
echo "$ACCESS_URL"
echo ""
echo "📋 Copy this link to access the application"
echo "🔒 This is a private, secure link for internal use only"
