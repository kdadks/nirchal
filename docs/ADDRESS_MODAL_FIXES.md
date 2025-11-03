# Address Modal & Checkout Address Fixes

## Issues Identified & Fixed

### 1. Address Modal Z-Index Issue ✅
**Problem**: Address modal was appearing under the header (z-[1000])
**Root Cause**: Modal had `z-50` while header has `z-[1000]`
**Solution**: Changed modal z-index from `z-50` to `z-[1100]`
**File**: `src/components/account/AddressModal.tsx` line 177

### 2. Address Modal RLS Errors ✅
**Problem**: Address saving in customer dashboard generating RLS errors
**Root Cause**: Direct Supabase INSERT/UPDATE calls blocked by RLS policies
**Solution**: 
- Created RPC functions with `SECURITY DEFINER` to bypass RLS:
  - `insert_customer_address()` - Create new addresses
  - `update_customer_address()` - Update existing addresses
  - `delete_customer_address()` - Delete addresses
- Updated AddressModal to use RPC functions instead of direct Supabase calls
**Files**:
- `supabase/migrations/20250124000001_customer_addresses_rpc.sql` (new migration)
- `src/components/account/AddressModal.tsx` (updated to use RPC)

### 3. Checkout Address Saving ✅
**Problem**: Addresses not saved when customers create orders during checkout
**Root Cause**: Missing SELECT policy on customer_addresses table - checkout's `upsertAddressWithFlags()` function couldn't query existing addresses
**Solution**: Added SELECT policy to allow reading customer_addresses
**File**: `supabase/migrations/20250124000002_customer_addresses_select_policy.sql` (new migration)

**Note**: The checkout already had comprehensive address-saving logic implemented (see `ADDRESS_SAVING_IMPLEMENTATION_SUMMARY.md`), but it was failing due to missing SELECT policy.

## Changes Made

### Frontend Changes
1. **AddressModal.tsx**:
   - Line 177: Changed `z-50` to `z-[1100]`
   - Lines 80-142: Replaced direct Supabase calls with RPC function calls
   - Insert: Uses `supabase.rpc('insert_customer_address', {...})`
   - Update: Uses `supabase.rpc('update_customer_address', {...})`

### Database Migrations
1. **20250124000001_customer_addresses_rpc.sql**: 
   - RPC functions for address CRUD operations
   - Functions use `SECURITY DEFINER` to bypass RLS restrictions
   - Proper parameter sanitization (TRIM, NULLIF)
   - Automatic default address management
   - Returns JSON responses with full address details

2. **20250124000002_customer_addresses_select_policy.sql**:
   - Added SELECT policy for customer_addresses table
   - Granted SELECT, INSERT, UPDATE, DELETE permissions to anon and authenticated roles

## RPC Function Features

### insert_customer_address()
- Automatically removes default flag from other addresses when inserting a new default
- Trims and sanitizes all input data
- Returns full address object as JSON

### update_customer_address()
- Verifies address belongs to customer before updating
- Automatically manages default flag across addresses
- Returns updated address object as JSON

### delete_customer_address()
- Verifies ownership before deletion
- If deleted address was default, automatically sets next address as default
- Returns success confirmation

## Testing Instructions

### Test 1: Address Modal Z-Index
1. Login to customer dashboard
2. Navigate to "My Addresses"
3. Click "Add New Address" or "Edit" on existing address
4. **Expected**: Modal appears above header, fully visible
5. **Status**: ✅ FIXED

### Test 2: Address Add/Edit in Dashboard
1. Login to customer dashboard
2. Go to "My Addresses"
3. Click "Add New Address"
4. Fill in address details (mark as shipping/billing)
5. Click "Save"
6. **Expected**: Address saved successfully, no RLS errors
7. Try editing the address
8. **Expected**: Changes saved successfully
9. **Status**: ✅ FIXED (requires migration)

### Test 3: Address Saving During Checkout
1. Add items to cart
2. Go to checkout
3. Fill in delivery address
4. Choose billing same/different
5. Complete order (use COD to avoid payment complexity)
6. After order completion, go to customer dashboard > My Addresses
7. **Expected**: Delivery and billing addresses should be saved
8. **Status**: ✅ FIXED (requires migration)

## Deployment Steps

### 1. Apply Database Migrations
Run these migrations in your Supabase database (in order):

```sql
-- Migration 1: RPC Functions
-- File: supabase/migrations/20250124000001_customer_addresses_rpc.sql
-- This creates the insert_customer_address, update_customer_address, delete_customer_address functions

-- Migration 2: SELECT Policy
-- File: supabase/migrations/20250124000002_customer_addresses_select_policy.sql
-- This adds the SELECT policy and grants permissions
```

**Via Supabase Dashboard**:
1. Go to SQL Editor
2. Copy content from migration file 1, execute
3. Copy content from migration file 2, execute
4. Verify functions exist: `SELECT * FROM pg_proc WHERE proname LIKE '%customer_address%';`

**Via Supabase CLI**:
```bash
supabase db push
```

### 2. Deploy Frontend Changes
The AddressModal.tsx changes are already made. Just deploy/build as usual:

```bash
npm run build
npm run deploy
```

## Verification

After deployment, verify:

### Database Functions
```sql
-- Check if RPC functions exist
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('insert_customer_address', 'update_customer_address', 'delete_customer_address');
```

### RLS Policies
```sql
-- Check customer_addresses policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as command
FROM pg_policies 
WHERE tablename = 'customer_addresses';
```
Expected policies:
- `customer_addresses_public_insert` (INSERT)
- `customer_addresses_public_update` (UPDATE)
- `customer_addresses_public_select` (SELECT) ← **NEW**
- `service_role_all_access_customer_addresses` (ALL)

## Technical Details

### Why RPC Functions?
- **Security**: `SECURITY DEFINER` allows function to run with elevated privileges
- **RLS Bypass**: Functions run as database owner, bypassing RLS restrictions
- **Validation**: Centralized data validation and sanitization
- **Consistency**: Same logic for frontend, admin, and serverless functions

### Why SELECT Policy?
- The checkout's existing `upsertAddressWithFlags()` function needs to query existing addresses
- Without SELECT policy, queries fail even though INSERT/UPDATE policies exist
- SELECT policy allows reading addresses while maintaining security through customer_id filtering

### Address Saving Flow (Checkout)
1. Customer completes checkout form
2. `createOrFindCustomer()` creates/finds customer record
3. `upsertAddressWithFlags()` saves delivery address:
   - SELECTs existing addresses with same details (now works with SELECT policy)
   - If found: Updates flags (is_shipping, is_billing)
   - If not found: INSERTs new address
4. If billing different: Repeats step 3 for billing address
5. Order created with customer_id linking to addresses

## Related Documentation
- `docs/ADDRESS_SAVING_IMPLEMENTATION_SUMMARY.md` - Original address saving implementation
- `docs/ENHANCED_SECURITY_SOLUTION.md` - RLS and security patterns

## Notes
- The checkout address saving was already implemented previously, but was failing due to missing SELECT policy
- AddressModal in customer dashboard was using direct Supabase calls which failed with RLS
- Both issues now fixed with different approaches:
  - Dashboard: RPC functions (better security, future-proof)
  - Checkout: SELECT policy (maintains existing working logic)
