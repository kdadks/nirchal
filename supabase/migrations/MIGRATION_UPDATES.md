# Database Migration Updates - Return & Refund System

## Summary of Changes

Based on the database schema check, the following updates were made to ensure compatibility with the existing Nirchal database structure:

## ✅ Changes Made to Migration Files

### 1. User References (All Migrations)
**Issue:** No `users` table exists - Supabase uses `auth.users`

**Changes:**
- Removed all `REFERENCES users(id)` foreign key constraints
- Updated to use `UUID` fields with comments indicating they reference `auth.users(id)`
- Affected fields:
  - `return_requests.customer_id`
  - `return_requests.received_by`
  - `return_requests.inspected_by`
  - `return_requests.decision_by`
  - `return_items.restocked_by`
  - `return_status_history.changed_by`
  - `razorpay_refund_transactions.initiated_by`

### 2. Order Items Column Names
**Issue:** `order_items` table has different column names than expected

**Changes in `20251023000002_create_return_items_table.sql`:**
- `variant_id` → `product_variant_id` ✅
- `variant_name` → Split into `variant_size`, `variant_color`, `variant_material` ✅
- `sku` → `product_sku` ✅
- `price` → Already using `unit_price` ✅

### 3. RLS Policies - Admin Role Check
**Issue:** No `users` table to check roles

**Changes in `20251023000006_create_rls_policies.sql`:**
- Updated all admin checks to use JWT claims instead of users table
- Changed from:
  ```sql
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
  ```
- To:
  ```sql
  (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  OR
  (auth.jwt()->'user_metadata'->>'role' IN ('admin', 'super_admin'))
  ```
- Updated `is_admin()` helper function to use JWT claims

### 4. Status History Trigger
**Changes in `20251023000003_create_return_status_history_table.sql`:**
- Updated role detection to check `auth.users.raw_user_meta_data->>'role'` instead of users table

## 📊 Database Structure Verified

### ✅ Existing Tables (Confirmed)
- `orders` - Has all required fields
- `order_items` - Confirmed structure
- `products` - Exists with `category_id`
- `categories` - Exists (for service detection)
- `settings` - Exists and ready for return settings

### ❌ Missing Tables
- `users` - Not needed (using Supabase Auth)

### 🔑 Key Fields Confirmed

**orders table:**
- ✅ `id`, `customer_id`, `status`, `total_amount`
- ✅ `shipping_amount`, `discount_amount`, `subtotal`
- ✅ `payment_status`, `delivered_at`
- ✅ `razorpay_payment_id`, `razorpay_order_id`

**order_items table:**
- ✅ `id`, `order_id`, `product_id`
- ✅ `product_variant_id` (not variant_id)
- ✅ `product_name`, `product_sku` (not sku)
- ✅ `variant_size`, `variant_color`, `variant_material`
- ✅ `unit_price`, `total_price`, `quantity`

**products table:**
- ✅ `id`, `name`, `category_id`
- ⚠️ No `type`, `is_service`, or `is_final_sale` columns

## 🎯 Service Detection Strategy

Since products table doesn't have `is_service` or `type` fields, we'll use:

1. **Primary Method:** Check `category_id` against a predefined list of service category IDs
2. **Alternative:** Add settings for service category names/slugs
3. **Future Enhancement:** Consider adding `is_service` boolean to products table

### Recommended Settings Update
```sql
-- Add to settings for service detection
INSERT INTO settings (category, key, value, data_type, description) VALUES
('returns', 'service_category_ids', '[]', 'string', 'Array of category IDs that represent services (not returnable)'),
('returns', 'service_category_slugs', '["services", "custom-stitching", "alterations"]', 'string', 'Array of category slugs that represent services');
```

## 📝 Migration Files Ready

All migration files have been updated and are ready to execute:

1. ✅ `20251023000001_create_return_requests_table.sql`
2. ✅ `20251023000002_create_return_items_table.sql`
3. ✅ `20251023000003_create_return_status_history_table.sql`
4. ✅ `20251023000004_create_razorpay_refund_transactions_table.sql`
5. ✅ `20251023000005_add_return_settings.sql`
6. ✅ `20251023000006_create_rls_policies.sql`

## 🚀 Next Steps

### 1. Execute Migrations
Run migrations in Supabase Dashboard SQL Editor in order (001 through 006)

### 2. Verify Installation
Run the test script:
```bash
node scripts/check-database-schema.js
```

### 3. Add Service Category Settings
After migrations, add service category configuration:
```sql
UPDATE settings 
SET value = '["service-category-id-1", "service-category-id-2"]'
WHERE category = 'returns' AND key = 'service_category_ids';
```

### 4. Test RLS Policies
Verify that:
- Customers can only see their own returns
- Admins can see all returns
- JWT role checking works correctly

### 5. Update Admin User Metadata
Ensure admin users have role in their user metadata:
```sql
-- Check current admin user metadata
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@example.com';

-- Update if needed (via Supabase Dashboard > Authentication > Users)
-- Add: { "role": "admin" } to user metadata
```

## 🔍 Important Notes

### Auth.users vs users table
- Supabase uses `auth.users` for authentication
- No custom `users` table in your database
- All user references are via UUID without foreign key constraints
- Role checking done via JWT claims or user metadata

### RLS Policy Testing
After deployment, test policies with:
```javascript
// As customer
const { data, error } = await supabase
  .from('return_requests')
  .select('*');
// Should only return customer's own returns

// As admin (with role in JWT)
const { data, error } = await supabase
  .from('return_requests')
  .select('*');
// Should return all returns
```

### Product Service Detection
Will need application-level logic:
```typescript
const isServiceProduct = (product) => {
  const serviceCategoryIds = getSettingValue('service_category_ids');
  return serviceCategoryIds.includes(product.category_id);
};
```

## ⚠️ Potential Issues & Solutions

### Issue: Admin role not detected
**Solution:** Ensure JWT contains role claim or user metadata has role field

### Issue: Foreign key constraint failures
**Solution:** All foreign key constraints to users table removed - only orders and products have constraints

### Issue: Service products not detected
**Solution:** Manually configure service category IDs in settings after checking your categories table

## 📋 Checklist Before Deployment

- [x] Updated all user references to remove FK constraints
- [x] Updated order_items column names to match actual schema
- [x] Updated RLS policies to use JWT claims
- [x] Verified all required tables exist
- [x] Updated status history trigger for role detection
- [ ] Execute migrations in Supabase
- [ ] Configure service category IDs in settings
- [ ] Test RLS policies with customer and admin users
- [ ] Verify return number generation works
- [ ] Verify refund number generation works

---

**Status:** ✅ Migration files updated and ready for deployment
**Next Action:** Execute migrations in Supabase Dashboard
