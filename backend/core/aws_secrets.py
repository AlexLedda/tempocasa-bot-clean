"""
AWS Secrets Manager Integration
Loads secrets from AWS Secrets Manager for production deployment
"""
import json
import logging
import os
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Flag to check if boto3 is available
BOTO3_AVAILABLE = False

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    logger.warning("boto3 not installed. AWS Secrets Manager disabled. Install with: pip install boto3")


class AWSSecretsManager:
    """
    AWS Secrets Manager client for loading application secrets
    """
    
    def __init__(self, region_name: str = "eu-central-1"):
        self.region_name = region_name
        self.client = None
        self.enabled = False
        
        if BOTO3_AVAILABLE:
            try:
                self.client = boto3.client(
                    'secretsmanager',
                    region_name=region_name
                )
                self.enabled = True
                logger.info(f"✓ AWS Secrets Manager initialized (region: {region_name})")
            except Exception as e:
                logger.warning(f"AWS Secrets Manager initialization failed: {e}")
    
    def get_secret(self, secret_name: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve secret from AWS Secrets Manager
        
        Args:
            secret_name: Name of the secret in Secrets Manager
            
        Returns:
            Dictionary containing secret key-value pairs, or None if failed
        """
        if not self.enabled:
            logger.warning("AWS Secrets Manager not enabled")
            return None
        
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            
            # Parse the secret string
            if 'SecretString' in response:
                secret = json.loads(response['SecretString'])
                logger.info(f"✓ Successfully loaded secret: {secret_name}")
                return secret
            else:
                logger.error(f"Secret {secret_name} does not contain SecretString")
                return None
                
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            if error_code == 'ResourceNotFoundException':
                logger.error(f"Secret {secret_name} not found")
            elif error_code == 'InvalidRequestException':
                logger.error(f"Invalid request for secret {secret_name}")
            elif error_code == 'InvalidParameterException':
                logger.error(f"Invalid parameter for secret {secret_name}")
            elif error_code == 'DecryptionFailure':
                logger.error(f"Decryption failed for secret {secret_name}")
            elif error_code == 'InternalServiceError':
                logger.error(f"AWS internal service error for secret {secret_name}")
            else:
                logger.error(f"Error retrieving secret {secret_name}: {e}")
            
            return None
        except Exception as e:
            logger.error(f"Unexpected error retrieving secret {secret_name}: {e}")
            return None
    
    def load_secrets_to_env(self, secret_name: str) -> bool:
        """
        Load secrets from AWS Secrets Manager and set as environment variables
        
        Args:
            secret_name: Name of the secret in Secrets Manager
            
        Returns:
            True if successful, False otherwise
        """
        secrets = self.get_secret(secret_name)
        
        if not secrets:
            return False
        
        # Set each secret as environment variable
        for key, value in secrets.items():
            os.environ[key] = str(value)
            logger.debug(f"Set environment variable: {key}")
        
        logger.info(f"✓ Loaded {len(secrets)} secrets to environment")
        return True


# Singleton instance
secrets_manager = AWSSecretsManager()


def load_aws_secrets(secret_name: str = None) -> bool:
    """
    Helper function to load secrets from AWS Secrets Manager
    
    Args:
        secret_name: Name of the secret (defaults to tempocasa-bot-secrets-production)
        
    Returns:
        True if successful, False otherwise
    """
    if not secret_name:
        # Default secret name based on environment
        env = os.getenv("ENVIRONMENT", "production")
        secret_name = f"tempocasa-bot-secrets-{env}"
    
    return secrets_manager.load_secrets_to_env(secret_name)
