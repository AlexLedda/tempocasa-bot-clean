# Requirements Installation Guide

## Overview

This document explains how to install the backend dependencies for the Tempocasa Bot application.

## Files

- **`requirements.txt`**: Production dependencies (optimized and categorized)
- **`requirements-dev.txt`**: Development tools (linting, testing, formatting)

## Installation

### Production Environment

```bash
cd backend
pip install -r requirements.txt
```

### Development Environment

```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## ~~Special Dependency: emergentintegrations~~ ✅ RESOLVED

**UPDATE**: The `emergentintegrations` dependency has been **removed** and replaced with the official **Anthropic SDK** (`anthropic==0.39.0`).

The code now uses the official Anthropic Python SDK directly, which is:
- ✅ Available on PyPI
- ✅ Officially supported
- ✅ Better documented
- ✅ More reliable

No special installation steps are needed - just run `pip install -r requirements.txt`.

## Environment Variables Required

Make sure your `.env` file contains:

```bash
# Database
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name

# Security
JWT_SECRET_KEY=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key  # For Claude AI chat

# Legacy support (optional, will use ANTHROPIC_API_KEY if not set)
# EMERGENT_LLM_KEY=your_anthropic_api_key

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# AWS (for production deployment)
AWS_SECRETS_NAME=tempocasa-bot-secrets-production
ENVIRONMENT=production
```

## Verification

After installation, verify all dependencies are installed:

```bash
python3 -c "import fastapi, motor, redis, cloudinary; print('✓ Core dependencies installed')"
```

## Troubleshooting

### Issue: `emergentintegrations` not found

**Solution**: Install from GitHub (see Option 1 above) or replace with direct SDK (see Option 2 above)

### Issue: Version conflicts

**Solution**: Use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Redis connection failed

**Solution**: Redis is optional. The application will work without it, but caching will be disabled.

## Updates

To update dependencies:

```bash
pip install --upgrade -r requirements.txt
```

To check for security vulnerabilities:

```bash
pip install pip-audit
pip-audit
```

## Production Deployment

For AWS/Render deployment:

1. Ensure `requirements.txt` is in the backend directory
2. Set all required environment variables in your deployment platform
3. Install `emergentintegrations` from GitHub in your build script:
   ```bash
   pip install git+https://github.com/emergentmethods/emergentintegrations.git@v0.1.0
   pip install -r requirements.txt
   ```

## Changes from Original

The optimized `requirements.txt` includes:

✅ **Pinned versions** for `schedule`, `reportlab`, and `qrcode`  
✅ **Organized categories** for better readability  
✅ **Separated dev dependencies** into `requirements-dev.txt`  
✅ **Documented** the `emergentintegrations` issue  
✅ **Removed** commented-out packages (moved to documentation)

All functionality remains the same, but the dependencies are now better organized and more maintainable.
