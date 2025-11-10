#!/bin/bash
set -e

echo "📦 Installing Python dependencies with Emergent repository..."

pip install --upgrade pip

pip install --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt

echo "✅ Dependencies installed successfully!"
