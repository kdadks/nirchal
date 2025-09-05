-- 🔒 ESSENTIAL DUPLICATE PAYMENT PROTECTION
-- Simple setup that avoids data type issues

-- Step 1: Add unique constraint to prevent duplicate payment IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_razorpay_payment_id 
ON orders (razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;

-- Step 2: Add performance index for payment queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_razorpay_id 
ON orders (payment_status, razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;

-- Step 3: Create monitoring views
CREATE OR REPLACE VIEW payment_status_summary AS
SELECT 
  payment_status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_amount
FROM orders
GROUP BY payment_status
ORDER BY order_count DESC;

-- Step 4: Create duplicate detection view
CREATE OR REPLACE VIEW duplicate_payment_check AS
SELECT 
  razorpay_payment_id,
  COUNT(*) as usage_count,
  string_agg(order_number, ', ') as affected_orders
FROM orders
WHERE razorpay_payment_id IS NOT NULL
GROUP BY razorpay_payment_id
HAVING COUNT(*) > 1;

-- Step 5: Verify setup worked
SELECT 
  'Essential duplicate payment protection setup complete!' as status,
  EXISTS(
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_orders_unique_razorpay_payment_id'
  ) as unique_index_created;

-- Step 6: Test for existing duplicates (should return no rows)
SELECT * FROM duplicate_payment_check;

-- 🎉 SUCCESS! Your essential duplicate payment protection is now active.
-- The unique index will prevent any duplicate payment IDs going forward.
