# Migration Deployment Guide

**Date:** 2025-01-24  
**Purpose:** Step-by-step guide to apply database fixes for type mismatch bugs

---

## ⚠️ CRITICAL: Read Before Proceeding

These migrations fix **critical bugs** that cause:
- Welcome emails not being tracked
- Payment operations failing silently  
- Orders stuck in pending status

**Estimated Downtime:** None (migrations are non-blocking)  
**Rollback Required:** No (only adds/fixes, no data loss)

---

## Migration Order (MUST apply in sequence)

```
1. 20250124000000_fix_customer_addresses_id.sql
2. 20250124000002_customer_addresses_select_policy.sql
3. 20250124000005_fix_mark_welcome_email_sent.sql
4. 20250124000006_fix_razorpay_order_functions.sql
```

---

## Method 1: Supabase Dashboard (Recommended)

### Step 1: Access SQL Editor
1. Login to Supabase Dashboard
2. Navigate to your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**

### Step 2: Apply Migrations (One by one)

#### Migration 1: Fix customer_addresses ID
```sql
-- Copy contents from: supabase/migrations/20250124000000_fix_customer_addresses_id.sql
-- Paste into SQL Editor
-- Click "Run" button
-- Wait for success message
```

#### Migration 2: Add SELECT policy
```sql
-- Copy contents from: supabase/migrations/20250124000002_customer_addresses_select_policy.sql
-- Paste into SQL Editor
-- Click "Run"
-- Wait for success
```

#### Migration 3: Fix welcome email tracking
```sql
-- Copy contents from: supabase/migrations/20250124000005_fix_mark_welcome_email_sent.sql
-- Paste into SQL Editor
-- Click "Run"
-- Wait for success
```

#### Migration 4: Fix Razorpay order functions
```sql
-- Copy contents from: supabase/migrations/20250124000006_fix_razorpay_order_functions.sql
-- Paste into SQL Editor
-- Click "Run"
-- Wait for success
```

### Step 3: Verify
```sql
-- Check function signatures
SELECT 
    routine_name, 
    data_type,
    ordinal_position,
    parameter_name,
    udt_name
FROM information_schema.parameters
WHERE specific_schema = 'public'
AND routine_name IN (
    'mark_welcome_email_sent',
    'get_razorpay_order_status',
    'mark_razorpay_payment_failed',
    'update_razorpay_payment'
)
ORDER BY routine_name, ordinal_position;

-- Expected results:
-- mark_welcome_email_sent: customer_id → uuid
-- get_razorpay_order_status: p_order_id → uuid
-- mark_razorpay_payment_failed: p_order_id → uuid
-- update_razorpay_payment: p_order_id → uuid
```

---

## Method 2: Supabase CLI

### Prerequisites
```powershell
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Apply Migrations
```powershell
# Navigate to project root
cd "d:\ITWala Projects\nirchal"

# Apply all migrations
supabase db push

# Verify migrations applied
supabase migration list
```

---

## Method 3: Manual SQL Execution

### Connect via psql
```powershell
# Get connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:6543/postgres"
```

### Run each migration
```sql
\i supabase/migrations/20250124000000_fix_customer_addresses_id.sql
\i supabase/migrations/20250124000002_customer_addresses_select_policy.sql
\i supabase/migrations/20250124000005_fix_mark_welcome_email_sent.sql
\i supabase/migrations/20250124000006_fix_razorpay_order_functions.sql
```

---

## Post-Migration Testing

### Test 1: Customer Registration
```typescript
// Test in browser console or API client
const response = await fetch('YOUR_API/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User'
  })
});
// Should succeed and return customer with UUID id
```

### Test 2: Welcome Email Tracking
```sql
-- Check if function works
SELECT mark_welcome_email_sent('PASTE_ACTUAL_CUSTOMER_UUID_HERE');
-- Should return: true

-- Verify database updated
SELECT id, email, welcome_email_sent, welcome_email_sent_at 
FROM customers 
WHERE id = 'PASTE_ACTUAL_CUSTOMER_UUID_HERE';
-- Should show: welcome_email_sent = true, timestamp populated
```

### Test 3: Address Operations
```typescript
// Add address via customer dashboard
// Should succeed without errors
// Check database:
SELECT id, customer_id, address_line_1 
FROM customer_addresses 
ORDER BY created_at DESC 
LIMIT 1;
// Should show auto-incremented id (bigint)
```

### Test 4: Payment Functions (If using)
```sql
-- Test order status lookup
SELECT * FROM get_razorpay_order_status('PASTE_ACTUAL_ORDER_UUID_HERE');
-- Should return order details if order exists with razorpay payment
```

---

## Troubleshooting

### Migration 1 Fails: "IDENTITY already exists"
```sql
-- This is OK! It means the fix was already applied.
-- Continue to next migration.
```

### Migration 3 or 4 Fails: "function does not exist"
```sql
-- Check if function exists with old signature
SELECT routine_name, data_type, parameter_name, udt_name
FROM information_schema.parameters
WHERE routine_name LIKE '%razorpay%' OR routine_name = 'mark_welcome_email_sent';

-- If shows bigint: Manually drop and recreate
DROP FUNCTION IF EXISTS mark_welcome_email_sent(bigint);
-- Then re-run migration
```

### RPC Call Still Failing
```typescript
// Clear Supabase client cache
localStorage.clear();
// Reload application
location.reload();
```

---

## Rollback (If Needed)

### Rollback Migration 4 (Razorpay functions)
```sql
-- Restore old versions (only if necessary)
DROP FUNCTION IF EXISTS public.get_razorpay_order_status(uuid);
DROP FUNCTION IF EXISTS public.mark_razorpay_payment_failed(uuid, jsonb);
DROP FUNCTION IF EXISTS public.update_razorpay_payment(uuid, varchar, varchar, jsonb);

-- Recreate with bigint (from backup)
-- Copy from lines 1989, 2257, 2624 of schema_backup_cleaned.sql
```

### Rollback Migration 3 (Welcome email)
```sql
DROP FUNCTION IF EXISTS public.mark_welcome_email_sent(uuid);
-- Recreate with bigint (from backup line 2284)
```

**Note:** Rollback NOT recommended as it reintroduces the bugs.

---

## Production Deployment Checklist

### Pre-Deployment
- [ ] Database backup created
- [ ] All migrations reviewed
- [ ] Testing plan prepared
- [ ] Rollback plan documented

### During Deployment
- [ ] Migration 1 applied and verified
- [ ] Migration 2 applied and verified  
- [ ] Migration 3 applied and verified
- [ ] Migration 4 applied and verified
- [ ] Function signatures verified (all uuid)

### Post-Deployment
- [ ] Customer registration tested
- [ ] Welcome email tracking tested
- [ ] Address add/edit tested
- [ ] Checkout flow tested
- [ ] Error logs monitored (first 24 hours)

---

## Support

### Documentation
- `DATABASE_TYPE_MISMATCHES_ANALYSIS.md` - Technical details
- `SCHEMA_VERIFICATION_SUMMARY.md` - Complete verification report

### Verification Queries
```sql
-- Check if migrations applied
SELECT version FROM supabase_migrations.schema_migrations 
WHERE version LIKE '20250124%'
ORDER BY version;

-- Should show all 4 migrations:
-- 20250124000000
-- 20250124000002
-- 20250124000005
-- 20250124000006
```

---

**Status:** Ready for deployment  
**Risk Level:** Low (fixes existing bugs, no data changes)  
**Estimated Time:** 5-10 minutes
