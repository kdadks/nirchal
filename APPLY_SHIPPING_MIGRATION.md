# Shipping Method Migration Instructions

## Migration File
`supabase/migrations/20251104000000_add_shipping_method.sql`

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `20251104000000_add_shipping_method.sql`
5. Click "Run"

### Option 2: Supabase CLI
```bash
supabase db push
```

### Option 3: Direct SQL Execution
Run the following SQL in your database:

```sql
-- Add shipping method fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20) DEFAULT 'standard' CHECK (shipping_method IN ('standard', 'express')),
ADD COLUMN IF NOT EXISTS express_delivery_fee DECIMAL(10, 2) DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON orders(shipping_method);

-- Comment for documentation
COMMENT ON COLUMN orders.shipping_method IS 'Shipping method: standard (free, 3-7 days) or express (₹250, 1-3 days)';
COMMENT ON COLUMN orders.express_delivery_fee IS 'Express delivery fee charged (₹250 for express, ₹0 for standard)';
```

## Verification
After applying, verify with:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('shipping_method', 'express_delivery_fee');
```

## Rollback (if needed)
```sql
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_method;
ALTER TABLE orders DROP COLUMN IF EXISTS express_delivery_fee;
DROP INDEX IF EXISTS idx_orders_shipping_method;
```
