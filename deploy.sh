#!/bin/bash

# Production Deployment Script
# This script deploys code to production while excluding image files

echo "🚀 Starting production deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Deployment aborted."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy using rsync with exclusions (adjust paths as needed)
echo "📤 Deploying to production (excluding images)..."

# Option 1: If deploying to a server via rsync
# rsync -avz --delete \
#   --exclude='public/images/products/' \
#   --exclude='public/images/categories/' \
#   --exclude='public/images/README.md' \
#   --exclude='*.log' \
#   --exclude='.git/' \
#   --exclude='node_modules/' \
#   ./ user@server:/path/to/production/

# Option 2: If using Netlify CLI
# netlify deploy --prod --exclude='public/images/products/**' --exclude='public/images/categories/**'

# Option 3: Copy to staging folder excluding images and sensitive files
echo "📁 Creating deployment package..."
rsync -av \
  --exclude='public/images/products/' \
  --exclude='public/images/categories/' \
  --exclude='public/images/README.md' \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='*.sql' \
  --exclude='*rls*.js' \
  --exclude='*rls*.sql' \
  --exclude='test-*.js' \
  --exclude='diagnose*.js' \
  --exclude='analyze*.js' \
  --exclude='fix-*.js' \
  --exclude='debug-*.html' \
  --exclude='*-diagnostics.js' \
  --exclude='security-*.js' \
  --exclude='*-settings-manager.js' \
  --exclude='add-webhook-secret.js' \
  --exclude='*_SETUP.md' \
  --exclude='GITHUB_API_SETUP.md' \
  --exclude='STORAGE_BUCKET_SETUP.md' \
  --exclude='RLS_*.md' \
  --exclude='SCHEMA_*.sql' \
  --exclude='scripts/*.sql' \
  --exclude='scripts/*rls*.js' \
  --exclude='scripts/test-*.js' \
  ./ ./deployment-package/

# Clean package.json for production
echo "🧹 Cleaning package.json for production..."
node clean-package.js

echo "✅ Deployment package created in ./deployment-package/"
echo "🎉 Ready to deploy to production!"

# Instructions
echo ""
echo "📋 Next steps:"
echo "1. Review the deployment-package/ folder"
echo "2. Upload deployment-package/ contents to your production server"
echo "3. Or use your preferred deployment method with the package"
