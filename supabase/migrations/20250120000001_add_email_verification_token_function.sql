-- Migration: Add email verification token storage function
-- Purpose: Bypass RLS restrictions to allow admin to store verification tokens
-- This function uses SECURITY DEFINER to bypass RLS policies

-- Create or replace function to store email verification token
CREATE OR REPLACE FUNCTION public.store_email_verification_token(
  p_customer_id uuid,
  p_token text,
  p_expires_at timestamp with time zone
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_rows_updated INTEGER;
BEGIN
  -- Update customer with verification token
  UPDATE public.customers 
  SET 
    reset_token = p_token,
    reset_token_expires = p_expires_at,
    updated_at = NOW()
  WHERE id = p_customer_id;
  
  -- Check if update was successful
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  IF v_rows_updated = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Customer not found'
    );
  END IF;
  
  -- Return success with the stored values
  RETURN json_build_object(
    'success', true,
    'message', 'Verification token stored',
    'customer_id', p_customer_id,
    'token', p_token,
    'expires_at', p_expires_at
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permissions to authenticated users (the admin frontend)
GRANT EXECUTE ON FUNCTION public.store_email_verification_token(uuid, text, timestamp with time zone) TO anon, authenticated;
