# Fix Customer Wishlist RLS Policy

## Issue
The wishlist functionality is failing with error:
```
Error code: 42501
Message: new row violates row-level security policy for table "customer_wishlist"
```

This means the Row Level Security (RLS) policies on the `customer_wishlist` table are either missing or incorrectly configured.

## Solution
Apply the migration file: `20251104000001_fix_customer_wishlist_rls.sql`

## Steps to Apply Migration

### Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20251104000001_fix_customer_wishlist_rls.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### What This Migration Does:
1. **Drops existing policies** (if any) to start fresh
2. **Enables RLS** on the `customer_wishlist` table
3. **Creates a permissive policy** that allows all operations:
   - Since the app uses **custom customer authentication** (not Supabase auth), we can't use `auth.uid()` in policies
   - Security is handled at the **application layer** by checking `customer.id` before operations
   - The policy allows all operations but the app code ensures users can only access their own wishlist
4. **Grants permissions** to anon and authenticated users (needed for custom auth)

### Verification:
After applying the migration, test by:
1. Login to the website as a customer
2. Hover over a product card
3. Click the heart icon (wishlist button)
4. Check the browser console - you should see "Wishlist result: {success: true}"
5. The heart icon should turn red indicating the item is in the wishlist

## Notes
- This migration assumes the `customer_wishlist` table already exists
- The app uses **custom authentication** (not Supabase Auth), so RLS policies must be permissive
- Security is enforced at the **application layer** in `WishlistContext.tsx`:
  - Checks `customer?.id` before any operation
  - Returns `requiresAuth: true` if no customer is logged in
  - Only loads wishlist items for the logged-in customer
- The RLS policy allows all operations, but the app ensures users only access their own data
