# Quick Start - AWS Deployment

## 🚀 Deploy in 3 Steps

### 1. Configure Secrets
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 2. Deploy Infrastructure
```bash
terraform init
terraform apply  # Type 'yes'
```

### 3. Deploy Application
```bash
cd ..
./scripts/deploy-backend-aws.sh   # Deploy backend
./scripts/deploy-frontend-aws.sh  # Deploy frontend
```

## 📋 Get Your URLs

```bash
# Backend URL
aws apprunner describe-service \
    --service-arn $(aws apprunner list-services --region eu-central-1 \
        --query "ServiceSummaryList[?ServiceName=='tempocasa-backend-service'].ServiceArn" \
        --output text) \
    --region eu-central-1 \
    --query 'Service.ServiceUrl' \
    --output text

# Frontend URL
cd terraform && terraform output cloudfront_domain
```

## 📚 Full Guide

See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for complete instructions.

## 💰 Costs

~€20-45/month with hybrid architecture (MongoDB Atlas Free + AWS)
