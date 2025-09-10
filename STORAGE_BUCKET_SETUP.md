# Supabase Storage Bucket Setup

## Issue Identified
The Supabase storage buckets (`product-images` and `category-images`) are missing, which is causing the storage cleanup during product/category deletion to fail silently.

## Current Status
- **Database**: Contains 46 product image records and 2 category image records
- **Storage**: No buckets exist (shows `Available buckets: []`)
- **Effect**: Images cannot be deleted from storage because buckets don't exist

## Required Actions

### 1. Create Storage Buckets via Supabase Dashboard

Go to your Supabase project dashboard → Storage → Create Bucket

**Create these buckets:**

1. **product-images**
   - Name: `product-images`
   - Public: ✅ Yes
   - File size limit: 50MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

2. **category-images**
   - Name: `category-images` 
   - Public: ✅ Yes
   - File size limit: 50MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

### 2. Alternative: Create via SQL Editor

If you prefer to use SQL, run these scripts in the Supabase SQL Editor:

1. Run `create_product_images_bucket.sql`
2. Run `create_category_images_bucket.sql`

### 3. Verify Setup

After creating the buckets, run the investigation script:
```bash
node investigate-storage.mjs
```

You should see:
```
Available buckets: product-images (public), category-images (public)
```

### 4. Storage Cleanup Behavior

Once buckets are created, the product/category deletion will:

1. ✅ **Find images** in `product_images` table and variant swatch images
2. ✅ **Extract filenames** from storage URLs 
3. ✅ **Delete files** from `product-images` bucket
4. ✅ **Delete database records**
5. ✅ **Clean storage** of orphaned files

### 5. Test the Fix

1. Create the buckets (step 1 or 2)
2. Try deleting products via admin panel
3. Check that images are removed from both database AND storage

## Root Cause
The application was trying to delete files from storage buckets that didn't exist, causing silent failures in the storage cleanup logic while database deletions succeeded.

## Prevention
- Add bucket existence check in storage utilities
- Add proper error handling for missing buckets
- Include bucket creation in deployment checklist
