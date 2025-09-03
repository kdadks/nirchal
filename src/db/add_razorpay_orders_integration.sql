-- Add Razorpay-specific columns to the orders table
-- This migration adds columns to store Razorpay order and payment information

-- Add Razorpay columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Create indexes for better performance on Razorpay lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id 
ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id 
ON orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
ON orders(payment_status);

-- Create a view for Razorpay orders for easier querying
CREATE OR REPLACE VIEW razorpay_orders AS
SELECT 
    id,
    order_number,
    customer_id,
    status,
    payment_status,
    payment_method,
    razorpay_order_id,
    razorpay_payment_id,
    payment_details,
    total_amount,
    created_at,
    updated_at
FROM orders 
WHERE payment_method = 'razorpay' 
  AND razorpay_order_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay order ID (order_xxx format)';
COMMENT ON COLUMN orders.razorpay_payment_id IS 'Razorpay payment ID (pay_xxx format) - populated after successful payment';
COMMENT ON COLUMN orders.payment_details IS 'Full payment response from Razorpay API including status, method, etc.';

-- Function to get Razorpay order status
CREATE OR REPLACE FUNCTION get_razorpay_order_status(p_order_id BIGINT)
RETURNS TABLE(
    order_number VARCHAR(50),
    payment_status VARCHAR(50),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_method_used TEXT,
    amount_paid DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_number,
        o.payment_status,
        o.razorpay_order_id,
        o.razorpay_payment_id,
        COALESCE(o.payment_details->>'method', 'unknown') as payment_method_used,
        o.total_amount as amount_paid
    FROM orders o
    WHERE o.id = p_order_id
      AND o.payment_method = 'razorpay';
END;
$$;

-- Function to update order with Razorpay payment details
CREATE OR REPLACE FUNCTION update_razorpay_payment(
    p_order_id BIGINT,
    p_razorpay_order_id VARCHAR(255),
    p_razorpay_payment_id VARCHAR(255),
    p_payment_details JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE orders 
    SET 
        payment_status = 'paid',
        razorpay_order_id = p_razorpay_order_id,
        razorpay_payment_id = p_razorpay_payment_id,
        payment_details = p_payment_details,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        id = p_order_id 
        AND payment_method = 'razorpay'
        AND payment_status IN ('pending', 'failed'); -- Only update if not already paid
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$;

-- Function to mark Razorpay payment as failed
CREATE OR REPLACE FUNCTION mark_razorpay_payment_failed(
    p_order_id BIGINT,
    p_error_details JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE orders 
    SET 
        payment_status = 'failed',
        payment_details = COALESCE(payment_details, '{}'::JSONB) || jsonb_build_object('error', p_error_details),
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        id = p_order_id 
        AND payment_method = 'razorpay'
        AND payment_status = 'pending';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$;

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT SELECT ON razorpay_orders TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_razorpay_order_status(BIGINT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION update_razorpay_payment(BIGINT, VARCHAR, VARCHAR, JSONB) TO service_role;
-- GRANT EXECUTE ON FUNCTION mark_razorpay_payment_failed(BIGINT, JSONB) TO service_role;

-- Sample usage examples (commented out - uncomment to use)
/*
-- To get Razorpay order status:
-- SELECT * FROM get_razorpay_order_status(12345);

-- To update an order with successful payment:
-- SELECT update_razorpay_payment(
--     12345, 
--     'order_abc123', 
--     'pay_def456', 
--     '{"method": "card", "bank": "HDFC", "wallet": null}'::jsonb
-- );

-- To mark payment as failed:
-- SELECT mark_razorpay_payment_failed(
--     12345,
--     '{"code": "BAD_REQUEST_ERROR", "description": "Payment failed"}'::jsonb
-- );

-- To view all Razorpay orders:
-- SELECT * FROM razorpay_orders ORDER BY created_at DESC;
*/

-- Validate existing orders table structure
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        missing_columns := array_append(missing_columns, 'payment_status');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    ) THEN
        missing_columns := array_append(missing_columns, 'payment_method');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required columns in orders table: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE 'Razorpay integration migration completed successfully';
END $$;
