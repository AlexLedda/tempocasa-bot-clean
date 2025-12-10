#!/bin/bash
# Frontend Deployment Script for AWS S3 + CloudFront
# Builds React app and deploys to S3 with CloudFront invalidation

set -e

echo "🚀 Deploying Tempocasa Frontend to AWS S3 + CloudFront..."

# Configuration
AWS_REGION="${AWS_REGION:-eu-central-1}"

# Get values from Terraform
cd terraform
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CLOUDFRONT_DIST_ID=$(terraform output -raw cloudfront_distribution_id)
BACKEND_URL=$(aws apprunner list-services --region ${AWS_REGION} \
    --query "ServiceSummaryList[?ServiceName=='tempocasa-backend-service'].ServiceArn" \
    --output text | xargs -I {} aws apprunner describe-service --service-arn {} --region ${AWS_REGION} \
    --query 'Service.ServiceUrl' --output text)
cd ..

echo "📦 S3 Bucket: ${S3_BUCKET}"
echo "☁️  CloudFront Distribution: ${CLOUDFRONT_DIST_ID}"
echo "🔗 Backend URL: https://${BACKEND_URL}"

# Step 1: Build frontend with production backend URL
echo "🏗️  Building React app..."
cd frontend

export REACT_APP_BACKEND_URL="https://${BACKEND_URL}"
npm install --legacy-peer-deps
npm run build

echo "✅ Build complete!"

# Step 2: Sync to S3
echo "⬆️  Uploading to S3..."
aws s3 sync build/ s3://${S3_BUCKET} \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload index.html and service-worker.js with no-cache
aws s3 cp build/index.html s3://${S3_BUCKET}/index.html \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

aws s3 cp build/service-worker.js s3://${S3_BUCKET}/service-worker.js \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/javascript"

if [ -f build/manifest.json ]; then
    aws s3 cp build/manifest.json s3://${S3_BUCKET}/manifest.json \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "application/json"
fi

echo "✅ Upload complete!"

# Step 3: Invalidate CloudFront cache
echo "♻️  Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_DIST_ID} \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "⏳ Waiting for invalidation to complete..."
aws cloudfront wait invalidation-completed \
    --distribution-id ${CLOUDFRONT_DIST_ID} \
    --id ${INVALIDATION_ID}

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudfront get-distribution \
    --id ${CLOUDFRONT_DIST_ID} \
    --query 'Distribution.DomainName' \
    --output text)

cd ..

echo ""
echo "✅ Frontend deployment complete!"
echo "🌐 CloudFront URL: https://${CLOUDFRONT_URL}"
echo "📦 S3 Bucket: s3://${S3_BUCKET}"
echo ""
echo "🎉 Your application is now live!"
