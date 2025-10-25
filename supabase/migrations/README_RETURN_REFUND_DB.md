# Return and Refund Management - Database Setup

## Overview

This directory contains SQL migrations for the complete Return and Refund Management System for Nirchal e-commerce platform.

## Migration Files

Execute these migrations in order:

### 1. `20251023000001_create_return_requests_table.sql`
**Purpose:** Creates the main `return_requests` table

**Features:**
- Stores customer return/refund requests
- Tracks complete workflow from submission to refund completion
- Includes inspection results and deduction details
- Razorpay integration fields
- Automatic return number generation (RET/YYYY/0001)
- Updated timestamp trigger

**Key Fields:**
- Status flow tracking
- Customer shipping information
- Inspection details
- Financial calculations
- Evidence (images/videos)
- Return address

### 2. `20251023000002_create_return_items_table.sql`
**Purpose:** Creates the `return_items` table for individual items in a return

**Features:**
- Tracks each product/variant in a return request
- Stores inspection results per item
- Calculates deductions per item
- Manages restocking workflow
- Supports exchange functionality

**Key Fields:**
- Product details snapshot
- Quantity and pricing
- Condition assessment
- Deduction calculations
- Restocking status
- Exchange item details

### 3. `20251023000003_create_return_status_history_table.sql`
**Purpose:** Creates audit trail for status changes

**Features:**
- Logs every status change automatically
- Tracks who made the change (customer/admin/system)
- Stores additional context as JSON
- Automatic trigger for status changes
- Immutable audit trail

**Key Fields:**
- From/to status
- Changed by user and role
- Timestamp
- Additional metadata

### 4. `20251023000004_create_razorpay_refund_transactions_table.sql`
**Purpose:** Creates Razorpay refund transaction tracking

**Features:**
- Tracks Razorpay API calls and responses
- Stores refund status progression
- Links to return requests and orders
- Transaction number generation (REFD/YYYY/0001)
- Deduction breakdown

**Key Fields:**
- Razorpay payment/refund IDs
- API responses (JSONB)
- Status tracking
- Amount breakdown
- Timeline tracking

### 5. `20251023000005_add_return_settings.sql`
**Purpose:** Inserts configuration settings

**Settings Categories:**
- Return policy (window, eligibility)
- Image/video requirements
- Return address
- Processing timelines
- Deduction rates
- Email notifications
- Razorpay integration
- Inventory management

### 6. `20251023000006_create_rls_policies.sql`
**Purpose:** Row Level Security policies

**Security Features:**
- Customers can only see their own returns
- Admins can see and manage all returns
- Secure data access based on authentication
- Granular permissions per table and operation

## Database Schema

### Tables Overview

```
return_requests (main table)
├── return_items (1:many)
├── return_status_history (1:many)
└── razorpay_refund_transactions (1:many)

Foreign Keys:
- orders table (order_id)
- users table (customer_id, admin user IDs)
- products table (product_id in return_items)
```

### Status Flow

```
pending_shipment → shipped_by_customer → received → 
under_inspection → approved/partially_approved/rejected → 
refund_initiated → refund_completed
```

## Installation Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Execute migrations in order (001 through 006):
   ```sql
   -- Copy and paste contents of each file
   -- Execute one at a time
   ```
4. Run `test_database_setup.sql` to verify

### Option 2: Via Supabase CLI

```bash
# Make sure you're in the project root
cd d:\ITWala Projects\nirchal

# Push all migrations
supabase db push

# Or run individually
supabase db execute -f supabase/migrations/20251023000001_create_return_requests_table.sql
supabase db execute -f supabase/migrations/20251023000002_create_return_items_table.sql
# ... and so on
```

### Option 3: Via Direct Database Connection

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Execute each migration file
\i supabase/migrations/20251023000001_create_return_requests_table.sql
\i supabase/migrations/20251023000002_create_return_items_table.sql
\i supabase/migrations/20251023000003_create_return_status_history_table.sql
\i supabase/migrations/20251023000004_create_razorpay_refund_transactions_table.sql
\i supabase/migrations/20251023000005_add_return_settings.sql
\i supabase/migrations/20251023000006_create_rls_policies.sql
```

## Verification

After running migrations, execute the test script:

```sql
-- In Supabase SQL Editor or psql
\i supabase/migrations/test_database_setup.sql
```

**Expected Results:**
- ✅ 4 tables created
- ✅ 20+ indexes created
- ✅ 5 functions created
- ✅ 2 triggers created
- ✅ 15+ RLS policies created
- ✅ 30+ settings inserted
- ✅ Return number generation works
- ✅ Refund transaction number generation works

## Testing

### Test Return Number Generation

```sql
SELECT generate_return_number();
-- Expected: RET/2025/0001

SELECT generate_return_number();
-- Expected: RET/2025/0002
```

### Test Refund Number Generation

```sql
SELECT generate_refund_transaction_number();
-- Expected: REFD/2025/0001

SELECT generate_refund_transaction_number();
-- Expected: REFD/2025/0002
```

### Test RLS Policies

```sql
-- As a customer (replace with actual user ID)
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims.sub TO 'customer-user-id';

SELECT * FROM return_requests;
-- Should only see own returns

-- As admin
SET LOCAL request.jwt.claims.sub TO 'admin-user-id';

SELECT * FROM return_requests;
-- Should see all returns
```

## Settings Configuration

After installation, you may want to customize settings:

```sql
-- Update return window to 14 days
UPDATE settings 
SET value = '14' 
WHERE category = 'returns' AND key = 'return_window_days';

-- Update return address
UPDATE settings 
SET value = 'Your Warehouse Name' 
WHERE category = 'returns' AND key = 'return_address_line1';

-- Update deduction rates
UPDATE settings 
SET value = '{"excellent": 0, "good": 10, "fair": 20, "poor": 40, "damaged": 60}' 
WHERE category = 'returns' AND key = 'quality_deduction_rates';
```

## Key Functions

### `generate_return_number()`
Generates unique return numbers in format `RET/YYYY/0001`

### `generate_refund_transaction_number()`
Generates unique refund transaction numbers in format `REFD/YYYY/0001`

### `update_return_requests_updated_at()`
Automatically updates `updated_at` field on return_requests updates

### `log_return_status_change()`
Automatically logs status changes to `return_status_history` table

### `is_admin(user_id UUID)`
Helper function to check if user has admin privileges

## Data Types Reference

### Return Status Values
- `pending_shipment` - Customer needs to ship product
- `shipped_by_customer` - Customer marked as shipped
- `received` - Package received at warehouse
- `under_inspection` - Being inspected
- `approved` - Full refund approved
- `partially_approved` - Partial refund (with deductions)
- `rejected` - Return rejected, no refund
- `refund_initiated` - Razorpay refund started
- `refund_completed` - Refund successfully processed

### Inspection Status Values
- `passed` - Item in perfect condition
- `failed` - Item failed inspection
- `partial_pass` - Some items passed, some failed

### Condition Values (per item)
- `excellent` - Like new (0% deduction)
- `good` - Minor wear (5% deduction)
- `fair` - Noticeable wear (15% deduction)
- `poor` - Significant damage (30% deduction)
- `damaged` - Severely damaged (50% deduction)
- `not_received` - Item not in package (100% deduction)

### Return Reasons
- `defective` - Product is defective/damaged
- `wrong_item` - Wrong product received
- `size_issue` - Size doesn't fit
- `not_as_described` - Product not as described
- `quality_issue` - Quality not as expected
- `color_mismatch` - Color different from image
- `other` - Other reasons

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'return%';

-- Drop and recreate if needed (CAUTION: Data loss!)
DROP TABLE IF EXISTS razorpay_refund_transactions CASCADE;
DROP TABLE IF EXISTS return_status_history CASCADE;
DROP TABLE IF EXISTS return_items CASCADE;
DROP TABLE IF EXISTS return_requests CASCADE;
```

**Error: "function already exists"**
```sql
-- Drop existing functions
DROP FUNCTION IF EXISTS generate_return_number();
DROP FUNCTION IF EXISTS generate_refund_transaction_number();
```

### RLS Policy Issues

```sql
-- Disable RLS for testing (NOT for production!)
ALTER TABLE return_requests DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
```

## Rollback

To rollback all changes:

```sql
-- WARNING: This will delete all data!

-- Drop tables in reverse order
DROP TABLE IF EXISTS razorpay_refund_transactions CASCADE;
DROP TABLE IF EXISTS return_status_history CASCADE;
DROP TABLE IF EXISTS return_items CASCADE;
DROP TABLE IF EXISTS return_requests CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_return_number();
DROP FUNCTION IF EXISTS generate_refund_transaction_number();
DROP FUNCTION IF EXISTS update_return_requests_updated_at();
DROP FUNCTION IF EXISTS log_return_status_change();
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Remove settings
DELETE FROM settings WHERE category = 'returns';
```

## Next Steps

After database setup:

1. ✅ **Phase 1:** Build customer return request flow
   - Return eligibility service
   - Return request form
   - Image upload

2. ✅ **Phase 2:** Build admin inspection workflow
   - Inspection form
   - Refund calculation
   - Razorpay integration

3. ✅ **Phase 3:** Advanced features
   - Exchange functionality
   - Analytics dashboard
   - Inventory integration

## Support

If you encounter issues:
1. Run `test_database_setup.sql` to identify missing components
2. Check Supabase logs for detailed error messages
3. Verify user roles and RLS policies
4. Review foreign key constraints with existing tables

## Schema Diagram

```
┌─────────────────────────┐
│   return_requests       │
├─────────────────────────┤
│ id (PK)                 │
│ order_id (FK)           │
│ customer_id (FK)        │
│ return_number (UNIQUE)  │
│ status                  │
│ inspection_status       │
│ razorpay_refund_id      │
│ ...                     │
└─────────────────────────┘
           │
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│   return_items          │  │  return_status_history   │
├─────────────────────────┤  ├──────────────────────────┤
│ id (PK)                 │  │ id (PK)                  │
│ return_request_id (FK)  │  │ return_request_id (FK)   │
│ product_id (FK)         │  │ from_status              │
│ condition_on_return     │  │ to_status                │
│ deduction_amount        │  │ changed_by (FK)          │
│ ...                     │  │ ...                      │
└─────────────────────────┘  └──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  razorpay_refund_transactions       │
├─────────────────────────────────────┤
│ id (PK)                             │
│ return_request_id (FK)              │
│ transaction_number (UNIQUE)         │
│ razorpay_payment_id                 │
│ razorpay_refund_id                  │
│ status                              │
│ ...                                 │
└─────────────────────────────────────┘
```

---

**Database setup complete!** 🚀

Ready to proceed with application development.
