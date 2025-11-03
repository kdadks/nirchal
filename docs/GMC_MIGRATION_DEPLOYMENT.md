# GMC Migration Deployment Guide

## Overview
This guide walks through deploying the Google Merchant Center database migration.

## Migration File
`supabase/migrations/20250124000007_add_gmc_product_fields.sql`

## What It Does
Adds Google Merchant Center fields to the products table:
- `gtin` - Global Trade Item Number (UPC/EAN/ISBN)
- `mpn` - Manufacturer Part Number
- `gender` - Female, Male, or Unisex
- `age_group` - Adult, Kids, Infant, Toddler, or Newborn
- `google_product_category` - Google Product Category taxonomy

## Deployment Methods

### Option 1: Supabase Dashboard (Recommended for Production)

1. **Login to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy Migration Content**
   - Open `supabase/migrations/20250124000007_add_gmc_product_fields.sql`
   - Copy entire contents

4. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for success message

5. **Verify Changes**
   ```sql
   -- Check that columns were added
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'products'
   AND column_name IN ('gtin', 'mpn', 'gender', 'age_group', 'google_product_category');
   ```

### Option 2: Supabase CLI (Local Development)

1. **Ensure CLI is Installed**
   ```bash
   npm install -g supabase
   ```

2. **Link to Project** (if not already)
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Push Migration**
   ```bash
   supabase db push
   ```

4. **Verify**
   ```bash
   supabase db remote status
   ```

### Option 3: Direct SQL Execution

If you have direct database access:

```bash
psql "postgresql://postgres:[password]@[host]:[port]/postgres" < supabase/migrations/20250124000007_add_gmc_product_fields.sql
```

## Verification Steps

After running the migration:

1. **Check Table Structure**
   ```sql
   \d products
   ```
   
   Should show new columns:
   - gtin (varchar(50))
   - mpn (varchar(100))
   - gender (varchar(20))
   - age_group (varchar(20))
   - google_product_category (varchar(255))

2. **Check Indexes**
   ```sql
   \di idx_products_gtin
   \di idx_products_mpn
   ```

3. **Test Constraints**
   ```sql
   -- This should fail (invalid gender)
   UPDATE products SET gender = 'InvalidValue' WHERE id = (SELECT id FROM products LIMIT 1);
   
   -- This should work
   UPDATE products SET gender = 'Female' WHERE id = (SELECT id FROM products LIMIT 1);
   ```

4. **Check Comments**
   ```sql
   SELECT col_description('products'::regclass, (
     SELECT ordinal_position 
     FROM information_schema.columns 
     WHERE table_name = 'products' AND column_name = 'gtin'
   ));
   ```

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_products_gtin;
DROP INDEX IF EXISTS idx_products_mpn;

-- Remove columns
ALTER TABLE products DROP COLUMN IF EXISTS gtin;
ALTER TABLE products DROP COLUMN IF EXISTS mpn;
ALTER TABLE products DROP COLUMN IF EXISTS gender;
ALTER TABLE products DROP COLUMN IF EXISTS age_group;
ALTER TABLE products DROP COLUMN IF EXISTS google_product_category;
```

## Post-Migration Tasks

1. **Restart Application** (if needed)
   - Clear any caches
   - Restart web server
   - Verify app still loads

2. **Test Admin Panel**
   - Login to admin panel
   - Navigate to Products > Edit Product
   - Verify GMC section appears
   - Try saving a product with GMC fields

3. **Test Frontend**
   - Visit a product detail page
   - View page source
   - Verify structured data includes new fields (if populated)

4. **Initial Data Population** (Optional)
   ```sql
   -- Set default gender for all existing products
   UPDATE products 
   SET gender = 'Female' 
   WHERE gender IS NULL 
   AND category_id IN (SELECT id FROM categories WHERE name ILIKE '%women%');

   -- Set default age group for all existing products
   UPDATE products 
   SET age_group = 'Adult' 
   WHERE age_group IS NULL;
   ```

## Common Issues

### Issue: Permission Denied
**Solution**: Ensure you're connected as superuser or have ALTER TABLE permissions

### Issue: Column Already Exists
**Solution**: Migration already applied, skip or rollback first

### Issue: Constraint Violation
**Solution**: Check that CHECK constraints match expected values exactly

### Issue: Index Creation Failed
**Solution**: Check if indexes with same names already exist

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review error messages carefully
3. Verify database connection
4. Check user permissions
5. Try running individual ALTER TABLE statements

## Timeline

- **Estimated Time**: 2-5 minutes
- **Downtime**: None (columns are nullable, backward compatible)
- **Rollback Time**: 1-2 minutes if needed

## Checklist

- [ ] Migration file reviewed and understood
- [ ] Database backup created (recommended)
- [ ] Migration executed successfully
- [ ] Verification queries run successfully
- [ ] Admin panel tested
- [ ] Frontend product pages tested
- [ ] Structured data validated
- [ ] Team notified of new fields available

---

**Status**: Ready to deploy
**Risk Level**: Low (adds nullable columns only)
**Backward Compatible**: Yes
