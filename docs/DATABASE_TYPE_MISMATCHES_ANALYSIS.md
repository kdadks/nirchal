# Database Type Mismatches Analysis

**Generated:** 2025-01-24  
**Purpose:** Comprehensive scan of backup schema vs. actual table structures to identify all type mismatches

## Executive Summary

Found **4 CRITICAL BUGS** in the backup schema where RPC function parameters don't match actual table column types. These cause silent failures where operations appear to execute but actually fail.

---

## Critical Findings

### 1. ✅ FIXED: `mark_welcome_email_sent` - Customer ID Type Mismatch

**Location:** Line 2284 in `schema_backup_cleaned.sql`

**Problem:**
```sql
-- BACKUP (WRONG):
CREATE FUNCTION public.mark_welcome_email_sent(customer_id bigint)

-- ACTUAL TABLE:
CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL
)
```

**Impact:** 
- ALL welcome email tracking failed silently since deployment
- Emails were sent but database never updated `welcome_email_sent` flag
- Frontend was calling `parseInt(customerId)` on UUID strings → NULL → silent failure

**Status:** ✅ FIXED in migration `20250124000005_fix_mark_welcome_email_sent.sql`

---

### 2. 🔴 CRITICAL: `get_razorpay_order_status` - Order ID Type Mismatch

**Location:** Line 1989 in `schema_backup_cleaned.sql`

**Problem:**
```sql
-- BACKUP (WRONG):
CREATE FUNCTION public.get_razorpay_order_status(p_order_id bigint)

-- ACTUAL TABLE:
CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL
)
```

**Impact:**
- Payment status checks fail silently
- Webhook verification cannot look up orders
- Any Razorpay status queries return NULL/empty

**Status:** 🔴 NEEDS FIX

---

### 3. 🔴 CRITICAL: `mark_razorpay_payment_failed` - Order ID Type Mismatch

**Location:** Line 2257 in `schema_backup_cleaned.sql`

**Problem:**
```sql
-- BACKUP (WRONG):
CREATE FUNCTION public.mark_razorpay_payment_failed(p_order_id bigint, p_error_details jsonb)

-- ACTUAL TABLE:
CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL
)
```

**Impact:**
- Failed payments not properly recorded
- Payment failure tracking doesn't work
- Customers may retry payments that already failed

**Status:** 🔴 NEEDS FIX

---

### 4. 🔴 CRITICAL: `update_razorpay_payment` - Order ID Type Mismatch

**Location:** Line 2624 in `schema_backup_cleaned.sql`

**Problem:**
```sql
-- BACKUP (WRONG):
CREATE FUNCTION public.update_razorpay_payment(p_order_id bigint, ...)

-- ACTUAL TABLE:
CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL
)
```

**Impact:**
- Payment confirmation updates fail
- Orders stuck in "pending" even after successful payment
- Critical bug affecting order fulfillment

**Status:** 🔴 NEEDS FIX

---

## Verified Correct Functions

### ✅ `create_checkout_customer`
```sql
-- CORRECT: Uses BIGINT internally but returns ID correctly
DECLARE
    customer_id BIGINT;  -- Internal variable (line 1537)
    
-- Function returns customers.id which is UUID
RETURN json_build_object('id', customer_id, ...)
```

**Analysis:** Despite using BIGINT variable name, this function:
1. Inserts into `customers` table (UUID id with auto-generation)
2. Uses `RETURNING id INTO customer_id` which captures the UUID
3. Returns the UUID correctly in JSON response
4. PostgreSQL allows assigning UUID to BIGINT variable (becomes text representation)

**Status:** ✅ NO FIX NEEDED (misleading variable name but works correctly)

---

### ✅ `register_customer`
```sql
-- CORRECT: Uses proper type reference
DECLARE
    customer_id customers.id%TYPE;  -- Matches table definition (line 2310)
```

**Analysis:** Uses PostgreSQL `%TYPE` to match table column type automatically.

**Status:** ✅ NO FIX NEEDED

---

## Table Schema Verification

### ✅ `customers` Table
```sql
CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    ...
)
```
**Foreign Key References:** Used by `orders.customer_id`, `customer_addresses.customer_id`, `invoices` (via orders), etc.

---

### ✅ `orders` Table
```sql
CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,  -- ✅ Matches customers.id
    ...
)
```
**Foreign Key References:** Used by `order_items.order_id`, `invoices.order_id`, etc.

---

### ✅ `customer_addresses` Table
```sql
CREATE TABLE public.customer_addresses (
    id bigint NOT NULL,  -- BIGSERIAL (auto-increment)
    customer_id uuid,     -- ✅ Matches customers.id
    ...
)
```
**Status:** ID uses bigint (correct for BIGSERIAL), customer_id uses uuid (correct FK)

---

### ✅ `invoices` Table
```sql
CREATE TABLE public.invoices (
    id bigint NOT NULL,      -- BIGSERIAL (auto-increment)
    order_id uuid NOT NULL,  -- ✅ Matches orders.id
    ...
)
```
**Status:** Correct mix of bigint (for auto-increment ID) and uuid (for FK reference)

---

## Frontend Code Analysis

### ✅ No parseInt/Number on UUIDs Found

**Searched patterns:**
- `parseInt(.*\.id)` - No matches
- `parseInt(.*customer_id)` - No matches (already fixed)
- `Number(.*\.id)` - Only used for `invoices.id` (bigint - correct)

**Invoice ID Usage:**
```typescript
// CORRECT: Converting BIGSERIAL to number
const typedInvoices = (invoices || []).map(inv => ({
  id: Number(inv.id),  // BIGSERIAL type - correct conversion
  order_id: String(inv.order_id),  // UUID type - correct conversion
}));
```

---

## Root Cause Analysis

### Why These Bugs Exist

1. **Schema Evolution:** Tables started with bigint IDs, later migrated to UUIDs
2. **Function Lag:** RPC functions not updated during migration
3. **Silent Failures:** PostgreSQL doesn't error on bigint parameter with UUID value
4. **Backup Preserved Bugs:** The backup itself contains these issues

### Why They Weren't Caught

1. **No Type Checking:** Supabase RPC calls don't validate parameter types at compile time
2. **Silent Coercion:** PostgreSQL attempts type conversion, fails quietly
3. **Partial Success:** Some operations work (inserts) while queries fail
4. **No Error Logs:** Failed WHERE clauses return empty results, not errors

---

## Required Migrations

### Priority 1: Critical Payment Functions
```sql
-- Fix all 3 Razorpay functions
DROP FUNCTION public.get_razorpay_order_status(bigint);
DROP FUNCTION public.mark_razorpay_payment_failed(bigint, jsonb);
DROP FUNCTION public.update_razorpay_payment(bigint, varchar, varchar, jsonb);

-- Recreate with uuid parameters
CREATE FUNCTION public.get_razorpay_order_status(p_order_id uuid) ...
CREATE FUNCTION public.mark_razorpay_payment_failed(p_order_id uuid, ...) ...
CREATE FUNCTION public.update_razorpay_payment(p_order_id uuid, ...) ...
```

### Priority 2: Already Fixed
- ✅ `mark_welcome_email_sent` - Migration already created

---

## Testing Checklist

After applying migrations:

### Customer Functions
- [ ] Register new customer → verify UUID returned
- [ ] Checkout as guest → verify customer created with UUID
- [ ] Welcome email sent → verify `welcome_email_sent` flag updates

### Order Functions  
- [ ] Create order → verify order has UUID id
- [ ] Check payment status → verify function returns correct data
- [ ] Mark payment failed → verify status updates
- [ ] Update payment success → verify order marked paid

### Address Functions
- [ ] Add customer address → verify auto-increment ID
- [ ] Update address → verify customer_id FK works

### Invoice Functions
- [ ] Generate invoice → verify order_id FK (uuid) works
- [ ] Download invoice → verify invoice.id (bigint) works

---

## Recommendations

### Immediate Actions
1. ✅ Apply `20250124000005_fix_mark_welcome_email_sent.sql`
2. 🔴 Create and apply order function fixes migration
3. ✅ Apply `20250124000000_fix_customer_addresses_id.sql`
4. ✅ Apply `20250124000002_customer_addresses_select_policy.sql`

### Preventive Measures
1. **Type Validation:** Add TypeScript types for RPC responses
2. **Integration Tests:** Test all RPC functions with actual IDs
3. **Schema Sync:** Keep migrations in sync with backup
4. **Code Review:** Check all function signatures during DB changes

### Documentation
1. ✅ This analysis document
2. Update API documentation with correct parameter types
3. Add comments to functions indicating expected types
4. Document bigint vs uuid usage patterns

---

## Conclusion

The backup schema contains 4 critical type mismatches:
- ✅ 1 fixed (mark_welcome_email_sent)
- 🔴 3 need immediate fixes (all Razorpay order functions)

**Impact:** These bugs cause silent failures in:
- Welcome email tracking (FIXED)
- Payment processing (NEEDS FIX)
- Order status updates (NEEDS FIX)

**Next Step:** Create migration `20250124000006_fix_razorpay_order_functions.sql`
