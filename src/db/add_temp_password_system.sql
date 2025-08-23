-- Add temporary password functionality for checkout customers
-- Run this in Supabase SQL editor

-- Function to generate a random temporary password
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  temp_password TEXT;
  charset TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
BEGIN
  -- Generate 8 character temporary password
  SELECT string_agg(
    substr(charset, ceil(random() * length(charset))::integer, 1),
    ''
  )
  FROM generate_series(1, 8)
  INTO temp_password;
  
  RETURN temp_password;
END;
$$;

-- Add temporary password fields to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS temp_password TEXT,
ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS temp_password_created_at TIMESTAMP WITH TIME ZONE;

-- Function to create customer with temporary password during checkout
CREATE OR REPLACE FUNCTION create_checkout_customer(
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_record customers%ROWTYPE;
  temp_pass TEXT;
  hashed_temp_pass TEXT;
  result JSON;
BEGIN
  -- Check if customer already exists
  SELECT * INTO customer_record 
  FROM customers 
  WHERE email = p_email;
  
  IF FOUND THEN
    -- Customer exists, just return their info
    result := json_build_object(
      'id', customer_record.id::text,
      'email', customer_record.email,
      'temp_password', NULL,
      'existing_customer', true
    );
    RETURN result;
  END IF;
  
  -- Generate temporary password
  temp_pass := generate_temp_password();
  hashed_temp_pass := extensions.crypt(temp_pass, extensions.gen_salt('bf'));
  
  -- Create new customer with temporary password
  INSERT INTO customers (
    email, 
    first_name, 
    last_name, 
    phone, 
    password_hash, 
    temp_password,
    password_change_required,
    temp_password_created_at,
    created_at, 
    updated_at
  )
  VALUES (
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    hashed_temp_pass,
    temp_pass, -- Store plain text temp password temporarily for email
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  RETURNING * INTO customer_record;
  
  result := json_build_object(
    'id', customer_record.id::text,
    'email', customer_record.email,
    'temp_password', temp_pass,
    'existing_customer', false
  );
  
  RETURN result;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition - customer was created between check and insert
    SELECT * INTO customer_record 
    FROM customers 
    WHERE email = p_email;
    
    result := json_build_object(
      'id', customer_record.id::text,
      'email', customer_record.email,
      'temp_password', NULL,
      'existing_customer', true
    );
    RETURN result;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create customer: %', SQLERRM;
END;
$$;

-- Function to change password (requires old password or temp password)
CREATE OR REPLACE FUNCTION change_customer_password(
  p_email TEXT,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_record customers%ROWTYPE;
  new_hash TEXT;
BEGIN
  -- Get customer record
  SELECT * INTO customer_record
  FROM customers
  WHERE email = p_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Customer not found');
  END IF;
  
  -- Verify old password (either regular password or temp password)
  IF NOT (
    extensions.crypt(p_old_password, customer_record.password_hash) = customer_record.password_hash
    OR (customer_record.temp_password IS NOT NULL AND p_old_password = customer_record.temp_password)
  ) THEN
    RETURN json_build_object('success', false, 'message', 'Invalid current password');
  END IF;
  
  -- Hash new password
  new_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));
  
  -- Update customer with new password
  UPDATE customers 
  SET 
    password_hash = new_hash,
    temp_password = NULL,
    password_change_required = false,
    temp_password_created_at = NULL,
    updated_at = CURRENT_TIMESTAMP
  WHERE email = p_email;
  
  RETURN json_build_object('success', true, 'message', 'Password updated successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_temp_password() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_checkout_customer(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION change_customer_password(TEXT, TEXT, TEXT) TO anon, authenticated;

-- Test the functions
SELECT create_checkout_customer('test@example.com', 'Test', 'User', '1234567890');
