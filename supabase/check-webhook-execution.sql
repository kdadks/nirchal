-- ============================================================================
-- CHECK WEBHOOK EXECUTION
-- Run this to see if webhook is receiving events
-- ============================================================================

-- Check recent order updates to see if webhook is writing
SELECT 
    order_number,
    razorpay_payment_id,
    payment_transaction_id,
    payment_status,
    payment_details IS NOT NULL as has_payment_details,
    updated_at,
    created_at,
    updated_at - created_at as time_diff
FROM orders
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- Check if payment_details column exists and is JSONB
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
    AND column_name IN ('payment_transaction_id', 'payment_details');
