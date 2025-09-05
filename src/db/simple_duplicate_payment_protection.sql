-- Simplified duplicate payment protection for orders table
-- This script adds essential protection without complex triggers

-- 1. Add unique index on razorpay_payment_id to prevent duplicate payment IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_razorpay_payment_id 
ON orders (razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;

-- 2. Add composite index for better performance on payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_razorpay_id 
ON orders (payment_status, razorpay_payment_id) 
WHERE razorpay_payment_id IS NOT NULL;

-- 3. Add simple audit table for payment changes
CREATE TABLE IF NOT EXISTS payment_audit_log (
  id SERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id),
  order_number TEXT,
  old_payment_status TEXT,
  new_payment_status TEXT,
  old_payment_id TEXT,
  new_payment_id TEXT,
  changed_by TEXT DEFAULT 'system',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_reason TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- 4. Create view for payment status monitoring
CREATE OR REPLACE VIEW payment_status_summary AS
SELECT 
  payment_status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_amount,
  MIN(created_at) as earliest_order,
  MAX(created_at) as latest_order
FROM orders
GROUP BY payment_status
ORDER BY 
  CASE payment_status
    WHEN 'paid' THEN 1
    WHEN 'pending' THEN 2
    WHEN 'failed' THEN 3
    ELSE 4
  END;

-- 5. Create view for duplicate payment detection
CREATE OR REPLACE VIEW duplicate_payment_check AS
SELECT 
  razorpay_payment_id,
  COUNT(*) as usage_count,
  array_agg(order_number) as affected_orders,
  array_agg(id) as order_ids
FROM orders
WHERE razorpay_payment_id IS NOT NULL
GROUP BY razorpay_payment_id
HAVING COUNT(*) > 1;

-- 6. Grant necessary permissions
GRANT SELECT, INSERT ON payment_audit_log TO authenticated;
GRANT SELECT ON payment_status_summary TO authenticated;
GRANT SELECT ON duplicate_payment_check TO authenticated;

-- 7. Add helpful comments
COMMENT ON INDEX idx_orders_unique_razorpay_payment_id IS 'Prevents duplicate Razorpay payment IDs across orders';
COMMENT ON TABLE payment_audit_log IS 'Audit trail for all payment status changes';
COMMENT ON VIEW payment_status_summary IS 'Summary of orders by payment status';
COMMENT ON VIEW duplicate_payment_check IS 'View to detect duplicate payment IDs';

-- Success message
SELECT 'Simplified duplicate payment protection successfully added' as status;
