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

# Option 3: Copy to staging folder excluding images
echo "📁 Creating deployment package..."
rsync -av \
  --exclude='public/images/products/' \
  --exclude='public/images/categories/' \
  --exclude='public/images/README.md' \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='*.log' \
  --exclude='.env' \
  ./ ./deployment-package/

echo "✅ Deployment package created in ./deployment-package/"
echo "🎉 Ready to deploy to production!"

# Instructions
echo ""
echo "📋 Next steps:"
echo "1. Review the deployment-package/ folder"
echo "2. Upload deployment-package/ contents to your production server"
echo "3. Or use your preferred deployment method with the package"
