# Deployment Guide

## Problem Solved
This setup allows you to:
- ✅ Keep product images in Git repository 
- ✅ Exclude images from production deployment
- ✅ Prevent large image files from being copied to production server

## Quick Deployment

### Option 1: Using npm script (Windows)
```bash
npm run deploy
```

### Option 2: Using npm script (Linux/Mac)
```bash
npm run deploy:bash
```

### Option 3: Manual PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Option 4: Manual Bash (Linux/Mac)
```bash
bash deploy.sh
```

## What Happens During Deployment

1. **Build Process**: Runs `npm run build` to create production build
2. **Package Creation**: Creates `deployment-package/` folder
3. **Selective Copy**: Copies all files EXCEPT:
   - `public/images/products/` (product images)
   - `public/images/categories/` (category images) 
   - `.git/` folder
   - `node_modules/`
   - Log files
   - Environment files

4. **Ready to Deploy**: Upload contents of `deployment-package/` to production

## Benefits

- **Git Repository**: Still contains all images for version control
- **Production Server**: Only gets code, no large image files
- **Clean Deployment**: Faster uploads, smaller production footprint
- **Admin Functionality**: Admins can still upload images locally

## File Structure After Deployment

```
production-server/
├── dist/                 # Built application
├── public/
│   ├── images/
│   │   └── payment/     # Static payment icons (included)
│   └── favicon.svg      # Static assets (included)
├── netlify/             # Netlify functions
└── ... (other code files)
# 🚫 NO product/category images copied
```

This way your production server stays clean while Git maintains the full history!
