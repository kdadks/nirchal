# Quick Migration Application Guide

## Apply These Migrations to Fix Address Issues

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to SQL Editor

2. **Apply Migration 1: RPC Functions**
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20250124000001_customer_addresses_rpc.sql
   -- Paste in SQL Editor and click "Run"
   ```

3. **Apply Migration 2: SELECT Policy**
   ```sql
   -- Copy entire content from:
   -- supabase/migrations/20250124000002_customer_addresses_select_policy.sql
   -- Paste in SQL Editor and click "Run"
   ```

4. **Verify Functions Were Created**
   ```sql
   -- Run this query to check:
   SELECT 
     proname as function_name,
     pg_get_function_arguments(oid) as arguments
   FROM pg_proc 
   WHERE proname IN ('insert_customer_address', 'update_customer_address', 'delete_customer_address');
   
   -- Should return 3 rows
   ```

5. **Verify Policies**
   ```sql
   -- Run this query:
   SELECT 
     policyname, 
     cmd as command
   FROM pg_policies 
   WHERE tablename = 'customer_addresses'
   ORDER BY policyname;
   
   -- Should show 4 policies including:
   -- - customer_addresses_public_select (SELECT)
   -- - customer_addresses_public_insert (INSERT)
   -- - customer_addresses_public_update (UPDATE)
   -- - service_role_all_access_customer_addresses (ALL)
   ```

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed and linked to your project
cd "d:\ITWala Projects\nirchal"
supabase db push
```

## After Migration

### Test the Fixes

1. **Test Address Modal (Customer Dashboard)**
   - Login to customer account
   - Go to "My Addresses"
   - Click "Add New Address"
   - Modal should appear ABOVE header
   - Fill form and save
   - Should save without errors

2. **Test Checkout Address Saving**
   - Add items to cart
   - Go to checkout
   - Fill delivery address
   - Complete order (use COD)
   - Check customer dashboard > My Addresses
   - Delivery address should be saved

### If Issues Occur

**Issue**: Functions not found
```sql
-- Check if extensions schema exists
SELECT nspname FROM pg_namespace WHERE nspname = 'extensions';

-- If not, create it and re-run migration 1
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
```

**Issue**: Policies already exist error
```sql
-- Drop existing policies if needed
DROP POLICY IF EXISTS customer_addresses_public_select ON public.customer_addresses;

-- Then re-run migration 2
```

**Issue**: Permission denied
```sql
-- Grant necessary permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

## Files to Deploy

After migrations are applied, deploy the frontend:

```powershell
# In project directory
npm run build

# Or deploy to Cloudflare Pages
npm run deploy
```

## Quick Verification Commands

```sql
-- 1. Check RPC functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%customer_address%';

-- 2. Test insert_customer_address function
SELECT insert_customer_address(
  'YOUR-CUSTOMER-UUID-HERE'::uuid,
  'Test',
  'User',
  NULL,
  'Test Address Line 1',
  NULL,
  'Mumbai',
  'Maharashtra',
  '400001',
  'India',
  '9876543210',
  true,
  true,
  true
);

-- 3. Check if policy allows SELECT
SELECT * FROM customer_addresses LIMIT 1;
-- Should not get permission denied error
```

## Summary

✅ Migration 1: Creates RPC functions for AddressModal
✅ Migration 2: Adds SELECT policy for checkout address saving
✅ Frontend: AddressModal now uses RPC functions
✅ Frontend: Checkout uses existing logic (now works with SELECT policy)

Both migrations are **safe to apply** to production database.
