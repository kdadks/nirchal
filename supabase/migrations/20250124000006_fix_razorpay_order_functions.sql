-- Migration: Fix Razorpay order function parameter types
-- Issue: RPC functions use bigint for p_order_id but orders.id is uuid
-- Impact: Payment status checks, failure marking, and payment updates all fail silently
-- Date: 2025-01-24

-- Drop existing functions with wrong parameter types
DROP FUNCTION IF EXISTS public.get_razorpay_order_status(bigint);
DROP FUNCTION IF EXISTS public.mark_razorpay_payment_failed(bigint, jsonb);
DROP FUNCTION IF EXISTS public.update_razorpay_payment(bigint, varchar, varchar, jsonb);

-- Recreate get_razorpay_order_status with correct uuid parameter
CREATE OR REPLACE FUNCTION public.get_razorpay_order_status(p_order_id uuid) 
RETURNS TABLE(
    order_number character varying, 
    payment_status character varying, 
    razorpay_order_id character varying, 
    razorpay_payment_id character varying, 
    payment_method_used text, 
    amount_paid numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Recreate mark_razorpay_payment_failed with correct uuid parameter
CREATE OR REPLACE FUNCTION public.mark_razorpay_payment_failed(p_order_id uuid, p_error_details jsonb) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Recreate update_razorpay_payment with correct uuid parameter
CREATE OR REPLACE FUNCTION public.update_razorpay_payment(
    p_order_id uuid, 
    p_razorpay_order_id character varying, 
    p_razorpay_payment_id character varying, 
    p_payment_details jsonb
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Add comments for future reference
COMMENT ON FUNCTION public.get_razorpay_order_status(uuid) IS 
'Retrieves Razorpay payment status for an order. FIXED: Changed p_order_id from bigint to uuid to match orders.id type.';

COMMENT ON FUNCTION public.mark_razorpay_payment_failed(uuid, jsonb) IS 
'Marks a Razorpay payment as failed with error details. FIXED: Changed p_order_id from bigint to uuid to match orders.id type.';

COMMENT ON FUNCTION public.update_razorpay_payment(uuid, varchar, varchar, jsonb) IS 
'Updates order with successful Razorpay payment details. FIXED: Changed p_order_id from bigint to uuid to match orders.id type.';
