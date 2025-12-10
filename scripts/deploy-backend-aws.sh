#!/bin/bash
# AWS App Runner Deployment Script
# This script builds and deploys the backend to AWS App Runner

set -e

echo "🚀 Deploying Tempocasa Backend to AWS App Runner..."

# Configuration
AWS_REGION="${AWS_REGION:-eu-central-1}"
SERVICE_NAME="tempocasa-backend"
ECR_REPO_NAME="tempocasa-backend"
APP_RUNNER_SERVICE_NAME="tempocasa-backend-service"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "📦 AWS Account: ${AWS_ACCOUNT_ID}"
echo "📦 ECR Repository: ${ECR_REPO_URI}"

# Step 1: Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository (if not exists)..."
aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository \
        --repository-name ${ECR_REPO_NAME} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true

# Step 2: Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${ECR_REPO_URI}

# Step 3: Build Docker image
echo "🏗️  Building Docker image..."
cd backend
docker build -t ${SERVICE_NAME}:latest .

# Step 4: Tag image
echo "🏷️  Tagging image..."
docker tag ${SERVICE_NAME}:latest ${ECR_REPO_URI}:latest
docker tag ${SERVICE_NAME}:latest ${ECR_REPO_URI}:$(date +%Y%m%d-%H%M%S)

# Step 5: Push to ECR
echo "⬆️  Pushing image to ECR..."
docker push ${ECR_REPO_URI}:latest
docker push ${ECR_REPO_URI}:$(date +%Y%m%d-%H%M%S)

echo "✅ Docker image pushed successfully!"

# Step 6: Get Terraform outputs for configuration
echo "📋 Getting infrastructure details from Terraform..."
cd ../terraform

VPC_CONNECTOR_ARN=$(terraform output -raw vpc_connector_arn)
INSTANCE_ROLE_ARN=$(terraform output -raw app_runner_instance_role_arn)
ACCESS_ROLE_ARN=$(terraform output -raw app_runner_access_role_arn)
REDIS_URL=$(terraform output -raw redis_url)
SECRETS_ARN=$(terraform output -raw secrets_manager_arn)

cd ..

# Step 7: Create or update App Runner service
echo "🚀 Deploying to App Runner..."

# Check if service exists
if aws apprunner list-services --region ${AWS_REGION} | grep -q ${APP_RUNNER_SERVICE_NAME}; then
    echo "♻️  Updating existing App Runner service..."
    
    # Get service ARN
    SERVICE_ARN=$(aws apprunner list-services --region ${AWS_REGION} \
        --query "ServiceSummaryList[?ServiceName=='${APP_RUNNER_SERVICE_NAME}'].ServiceArn" \
        --output text)
    
    # Update service
    aws apprunner update-service \
        --service-arn ${SERVICE_ARN} \
        --source-configuration "ImageRepository={ImageIdentifier=${ECR_REPO_URI}:latest,ImageRepositoryType=ECR,ImageConfiguration={Port=8000}}" \
        --region ${AWS_REGION}
    
    echo "✅ Service updated! Waiting for deployment..."
    
else
    echo "🆕 Creating new App Runner service..."
    
    # Create service configuration file
    cat > /tmp/apprunner-config.json <<EOF
{
  "ServiceName": "${APP_RUNNER_SERVICE_NAME}",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "${ECR_REPO_URI}:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8000",
        "RuntimeEnvironmentVariables": {
          "ENVIRONMENT": "production",
          "AWS_REGION": "${AWS_REGION}",
          "REDIS_URL": "${REDIS_URL}",
          "AWS_SECRETS_NAME": "tempocasa-bot-secrets-production"
        }
      }
    },
    "AuthenticationConfiguration": {
      "AccessRoleArn": "${ACCESS_ROLE_ARN}"
    }
  },
  "InstanceConfiguration": {
    "Cpu": "1 vCPU",
    "Memory": "2 GB",
    "InstanceRoleArn": "${INSTANCE_ROLE_ARN}"
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/api/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  },
  "NetworkConfiguration": {
    "EgressConfiguration": {
      "EgressType": "VPC",
      "VpcConnectorArn": "${VPC_CONNECTOR_ARN}"
    }
  }
}
EOF
    
    # Create service
    aws apprunner create-service \
        --cli-input-json file:///tmp/apprunner-config.json \
        --region ${AWS_REGION}
    
    echo "✅ Service created! Waiting for deployment..."
fi

# Wait for service to be ready
echo "⏳ Waiting for service to be running..."
aws apprunner wait service-running \
    --service-arn $(aws apprunner list-services --region ${AWS_REGION} \
        --query "ServiceSummaryList[?ServiceName=='${APP_RUNNER_SERVICE_NAME}'].ServiceArn" \
        --output text) \
    --region ${AWS_REGION}

# Get service URL
SERVICE_URL=$(aws apprunner describe-service \
    --service-arn $(aws apprunner list-services --region ${AWS_REGION} \
        --query "ServiceSummaryList[?ServiceName=='${APP_RUNNER_SERVICE_NAME}'].ServiceArn" \
        --output text) \
    --region ${AWS_REGION} \
    --query 'Service.ServiceUrl' \
    --output text)

echo ""
echo "✅ Deployment complete!"
echo "🌐 Service URL: https://${SERVICE_URL}"
echo "🏥 Health Check: https://${SERVICE_URL}/api/health"
echo ""
echo "📊 Monitor logs with:"
echo "   aws logs tail /aws/apprunner/${APP_RUNNER_SERVICE_NAME} --follow --region ${AWS_REGION}"
