#!/bin/bash
# Helper script to add anthropic_api_key to terraform.tfvars

set -e

TFVARS_FILE="terraform/terraform.tfvars"

echo "🔑 Anthropic API Key Setup Helper"
echo "=================================="
echo ""

# Check if terraform.tfvars exists
if [ ! -f "$TFVARS_FILE" ]; then
    echo "❌ Error: $TFVARS_FILE not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Check if anthropic_api_key already exists
if grep -q "anthropic_api_key" "$TFVARS_FILE"; then
    echo "⚠️  anthropic_api_key already exists in $TFVARS_FILE"
    echo ""
    read -p "Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    
    # Remove existing line
    sed -i.bak '/anthropic_api_key/d' "$TFVARS_FILE"
fi

# Prompt for API key
echo ""
echo "Please enter your Anthropic API key (starts with sk-ant-):"
read -s ANTHROPIC_KEY

# Validate key format
if [[ ! $ANTHROPIC_KEY =~ ^sk-ant- ]]; then
    echo ""
    echo "⚠️  Warning: Key doesn't start with 'sk-ant-'. Are you sure this is correct?"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Add to terraform.tfvars
echo "" >> "$TFVARS_FILE"
echo "# Anthropic (Claude)" >> "$TFVARS_FILE"
echo "anthropic_api_key = \"$ANTHROPIC_KEY\"" >> "$TFVARS_FILE"

echo ""
echo "✅ Successfully added anthropic_api_key to $TFVARS_FILE"
echo ""
echo "Next steps:"
echo "1. cd terraform"
echo "2. terraform plan"
echo "3. terraform apply"
