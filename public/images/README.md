# Images Directory

This directory contains static and dynamic images for the Nirchal e-commerce platform.

## Directory Structure

- `payment/` - Static payment method icons (tracked in Git)
- `products/` - Dynamic product images uploaded by admin (tracked in Git)
- `categories/` - Dynamic category images uploaded by admin (tracked in Git)

## Git & Deployment Strategy

### Git Repository
- **All images** (static and dynamic) are tracked in Git for version control
- **Product and category images** remain in repository for backup and history
- **Full image history** is maintained for rollback capabilities

### Production Deployment
- **Images are excluded** during production deployment via deployment scripts
- **Only code and static assets** are copied to production server
- **Deployment package** excludes `public/images/products/` and `public/images/categories/`

## Deployment Commands

To deploy to production (excluding images):
```bash
# Using npm script
npm run deploy

# Or directly
.\deploy.ps1
```

## Benefits of This Approach

✅ **Git Backup**: All images backed up in repository  
✅ **Clean Production**: No large image files on production server  
✅ **Fast Deployment**: Excludes large files during deployment  
✅ **Version Control**: Full history of image changes  
✅ **Admin Functionality**: Admins can upload images normally  

## Technical Details

- Product images are saved locally and served from the public directory
- Images are automatically renamed with timestamps to prevent conflicts
- The deployment script creates a `deployment-package/` folder (ignored by Git)
- Only the deployment package contents should be uploaded to production
