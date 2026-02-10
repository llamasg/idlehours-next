#!/bin/bash

# Hostinger FTP Deployment Script
# Deploys the built site to Hostinger via FTP using lftp

set -e  # Exit on error

echo "🚀 Starting FTP deployment to Hostinger..."

# Configuration
HOST="77.37.37.242"
PORT="21"
USERNAME="u289779063.paleturquoise-crow-983526.hostingersite.com"
REMOTE_ROOT="/public_html"

# Check if dist directories exist
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Please run 'npm run build' first."
  exit 1
fi

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
  echo "❌ Error: lftp is not installed."
  echo "Install it with:"
  echo "  Ubuntu/Debian: sudo apt-get install lftp"
  echo "  macOS: brew install lftp"
  echo "  WSL: sudo apt-get install lftp"
  exit 1
fi

# Create temporary deployment structure
echo "📦 Preparing deployment files..."
rm -rf .deploy-temp
mkdir -p .deploy-temp

# Copy main site files
cp -r dist/* .deploy-temp/

# Check if Sanity studio is built
if [ -d "cosyblog/dist" ]; then
  echo "📦 Including Sanity Studio..."
  mkdir -p .deploy-temp/studio
  cp -r cosyblog/dist/* .deploy-temp/studio/
else
  echo "⚠️  Warning: cosyblog/dist not found. Skipping Sanity Studio deployment."
fi

# Prompt for password
echo ""
read -sp "Enter FTP password: " PASSWORD
echo ""
echo ""

# Deploy using lftp mirror
echo "🔄 Uploading files to Hostinger (this may take a few minutes)..."
lftp -c "
set ftp:ssl-allow no
open -u ${USERNAME},${PASSWORD} -p ${PORT} ${HOST}
mirror -R --delete --verbose --exclude .git/ --exclude node_modules/ .deploy-temp ${REMOTE_ROOT}
bye
"

# Check if upload was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment complete!"
  echo "🌐 Your site should be live at: https://paleturquoise-crow-983526.hostingersite.com"
  echo "🎨 Sanity Studio at: https://paleturquoise-crow-983526.hostingersite.com/studio"
else
  echo ""
  echo "❌ Deployment failed!"
  exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf .deploy-temp

echo "✨ Done!"
