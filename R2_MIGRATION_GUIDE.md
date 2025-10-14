# Cloudflare R2 Image Migration Guide

This guide provides comprehensive instructions for migrating product and category images from GitHub storage to Cloudflare R2.

## Prerequisites

### 1. Cloudflare R2 Bucket Setup
- ✅ Bucket `product-images` already created
- You need to create an R2 API token with read/write permissions

### 2. Environment Variables Required

#### For Migration Script (Node.js environment):
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for migration
# OR use:
VITE_SUPABASE_ANON_KEY=your_anon_key  # If service role key not available

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=product-images
R2_PUBLIC_URL=https://your-r2-public-url  # Optional, generates default if not provided
```

#### For Frontend Application (Vite environment):
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare R2 Configuration (for admin uploads)
VITE_R2_ACCOUNT_ID=your_account_id
VITE_R2_ACCESS_KEY_ID=your_access_key
VITE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_R2_BUCKET_NAME=product-images
VITE_R2_PUBLIC_URL=https://your-r2-public-url
```

### 3. How to Get R2 Credentials

1. **Access Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to R2 section

2. **Create API Token**
   - Click "Manage R2 API Tokens"
   - Click "Create API Token"
   - Give it a name (e.g., "Image Migration Token")
   - Set permissions: Object Read & Write
   - Note down the Access Key ID and Secret Access Key

3. **Get Account ID**
   - Found in your Cloudflare dashboard URL or R2 overview page
   - Format: 32-character hexadecimal string

4. **Configure Public Access** (Important!)
   - Go to your R2 bucket settings
   - Enable "Public Access" or set up a custom domain
   - Note the public URL (e.g., `https://product-images.your-account.r2.dev`)

## Migration Steps

### Step 1: Prepare Environment

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Add all required environment variables to `.env`

3. Install dependencies (if not already done):
```bash
npm install
```

### Step 2: Test R2 Connection

Before running the full migration, test your R2 configuration:

```bash
node scripts/test-r2-connection.mjs
```

This will:
- Verify all environment variables are set
- Test connection to R2
- Upload a test file
- Download the test file
- Delete the test file

### Step 3: Dry Run Migration

Run the migration in dry-run mode to see what will happen:

```bash
node scripts/migrate-images-to-r2.mjs --dry-run
```

This will:
- Fetch all images from the database
- Log which images would be migrated
- **NOT make any actual changes**

Options:
- `--dry-run` - Preview migration without making changes
- `--batch-size=10` - Process 10 images at a time (default)
- `--products-only` - Migrate only product images
- `--categories-only` - Migrate only category images

### Step 4: Run Full Migration

After verifying the dry run, execute the migration:

```bash
node scripts/migrate-images-to-r2.mjs --batch-size=20
```

**What happens during migration:**
1. Fetches all GitHub-hosted image URLs from database
2. For each image:
   - Downloads from GitHub
   - Uploads to R2 with proper cache headers
   - Verifies the upload succeeded
   - Updates database with new R2 URL
3. Generates detailed report

**Progress tracking:**
- Real-time console output showing each image
- Batch processing with configurable size
- Error logging for failed migrations
- Final summary report

### Step 5: Review Migration Report

After migration completes, check the reports:

```bash
# View summary
cat migration-report.json

# View errors (if any)
cat migration-errors.json
```

### Step 6: Verify Images on Website

1. **Clear browser cache** to ensure you see new R2 images
2. Visit your website and check:
   - Product pages load images correctly
   - Category images display properly
   - Image variants (swatches) work
   - No broken images

### Step 7: Deploy to Production

Once verified on UAT:

```bash
# Commit changes
git add .
git commit -m "Add R2 storage support and migration scripts"

# Push to UAT for testing
git push origin uat

# After UAT verification, merge to main
git checkout main
git merge uat
git push origin main
```

## Architecture Changes

### Before Migration
```
GitHub Repository (public/images/products/)
    ↓
https://raw.githubusercontent.com/kdadks/nirchal/main/public/images/products/image.jpg
    ↓
Database stores GitHub URLs
    ↓
Website displays GitHub-hosted images
```

### After Migration
```
Cloudflare R2 (product-images bucket)
    ↓
https://product-images.your-account.r2.dev/products/image.jpg
    ↓
Database stores R2 URLs
    ↓
Website displays R2-hosted images
```

### Compatibility Layer
The updated `storageUtils.ts` now supports **both** GitHub and R2 URLs:
- Automatically detects URL type
- Handles GitHub URLs (legacy)
- Handles R2 URLs (new)
- No code changes needed in components

## Rollback Plan

If something goes wrong:

### Option 1: Database Rollback
The migration script does not delete original GitHub files. You can:

1. Stop the migration (Ctrl+C if still running)
2. Restore database from backup:
```sql
-- Restore product_images table from backup
-- (Use Supabase dashboard or pg_restore)
```

### Option 2: Re-run Migration
If some images failed to migrate:

1. Check `migration-errors.json` for failed images
2. Fix any issues (network, permissions, etc.)
3. Re-run migration - it will skip already migrated images

### Option 3: Manual Rollback
To revert a specific image back to GitHub:

```sql
UPDATE product_images
SET image_url = 'https://raw.githubusercontent.com/kdadks/nirchal/main/public/images/products/old-image.jpg'
WHERE id = 123;
```

## Performance Benefits

After migration to R2:
- ✅ **Faster load times** - R2 is a CDN-backed object storage
- ✅ **Better caching** - Optimized cache headers
- ✅ **Reduced GitHub API limits** - No more rate limiting
- ✅ **Scalability** - Designed for high-traffic scenarios
- ✅ **Cost effective** - Cloudflare R2 has no egress fees

## Troubleshooting

### Error: "Missing required environment variables"
- Ensure all environment variables are set in `.env`
- Check spelling and format of variable names

### Error: "Access Denied" or "403 Forbidden"
- Verify R2 API token has read/write permissions
- Check bucket name is correct
- Ensure public access is enabled on the bucket

### Error: "Network timeout"
- Reduce batch size: `--batch-size=5`
- Check internet connection
- Some images might be very large, increase Node.js timeout

### Images not displaying after migration
- Clear browser cache (hard refresh: Ctrl+Shift+R)
- Check R2 bucket has public access enabled
- Verify CORS settings on R2 bucket
- Check database URLs are correct

### Database update failed
- Ensure using `SUPABASE_SERVICE_ROLE_KEY` not anon key
- Check RLS policies allow updates
- Verify internet connection

## Maintenance

### Uploading New Images
After migration, new product/category images uploaded through the admin panel will:
- Automatically use R2 storage
- Follow the same folder structure
- Be stored with optimized cache headers

### Cleanup GitHub Images (Optional)
After confirming migration success and running in production for a while:
1. Create a backup of the `public/images/` folder
2. Delete migrated images from GitHub repository
3. Keep the folder structure for reference

## Support

If you encounter issues during migration:
1. Check `migration-report.json` for detailed statistics
2. Review `migration-errors.json` for specific errors
3. Test R2 connection with the test script
4. Verify all environment variables are correct
5. Try dry-run mode to diagnose issues

## Next Steps

After successful migration:
- [ ] Monitor website performance
- [ ] Set up R2 analytics in Cloudflare dashboard
- [ ] Configure custom domain for R2 bucket (optional)
- [ ] Set up automatic backups for R2 bucket
- [ ] Update documentation for admin users
