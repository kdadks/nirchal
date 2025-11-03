-- ============================================================================
-- TEST WEBHOOK ENDPOINT
-- ============================================================================

-- Check recent webhook activity by looking at order updates
SELECT 
    order_number,
    razorpay_payment_id,
    payment_transaction_id,
    payment_status,
    payment_details IS NOT NULL as has_payment_details,
    created_at,
    updated_at,
    updated_at - created_at as update_delay
FROM orders
WHERE created_at > NOW() - INTERVAL '1 hour'
    AND payment_status = 'paid'
ORDER BY created_at DESC;

-- If payment_transaction_id is NULL but payment_status is 'paid',
-- it means webhook was NOT triggered (only verify-razorpay-payment was called)
