-- ============================================================================
-- COMPREHENSIVE MIGRATION: Customer Profile & Payment Features
-- Date: 2025-11-03
-- Description: Adds all missing features for customer management and payments
-- ============================================================================

-- ====================================
-- PART 1: ADD MISSING COLUMNS TO CUSTOMERS TABLE
-- ====================================

-- Add welcome email tracking columns (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'welcome_email_sent') THEN
        ALTER TABLE customers ADD COLUMN welcome_email_sent BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column: welcome_email_sent';
    ELSE
        RAISE NOTICE 'Column already exists: welcome_email_sent';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'welcome_email_sent_at') THEN
        ALTER TABLE customers ADD COLUMN welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        RAISE NOTICE 'Added column: welcome_email_sent_at';
    ELSE
        RAISE NOTICE 'Column already exists: welcome_email_sent_at';
    END IF;
END $$;

-- Add password reset columns (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'reset_token') THEN
        ALTER TABLE customers ADD COLUMN reset_token TEXT DEFAULT NULL;
        RAISE NOTICE 'Added column: reset_token';
    ELSE
        RAISE NOTICE 'Column already exists: reset_token';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'reset_token_expires') THEN
        ALTER TABLE customers ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        RAISE NOTICE 'Added column: reset_token_expires';
    ELSE
        RAISE NOTICE 'Column already exists: reset_token_expires';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_welcome_email_sent ON customers(welcome_email_sent);
CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON customers(reset_token) WHERE reset_token IS NOT NULL;

-- Update existing customers to have welcome_email_sent = false if null
UPDATE customers SET welcome_email_sent = false WHERE welcome_email_sent IS NULL;

-- ====================================
-- PART 2: UPDATE create_checkout_customer FUNCTION
-- ====================================

CREATE OR REPLACE FUNCTION public.create_checkout_customer(
  p_email text, 
  p_first_name text, 
  p_last_name text, 
  p_phone text DEFAULT NULL::text
) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    customer_record customers%ROWTYPE;
    temp_password TEXT;
    customer_id UUID;
    needs_welcome BOOLEAN := false;
BEGIN
    -- Check if customer already exists
    SELECT * INTO customer_record FROM customers 
    WHERE email = p_email;
    
    IF FOUND THEN
        -- Existing customer - update their info if needed
        UPDATE customers 
        SET 
            first_name = COALESCE(p_first_name, first_name),
            last_name = COALESCE(p_last_name, last_name),
            phone = COALESCE(p_phone, phone),
            updated_at = NOW()
        WHERE id = customer_record.id;
        
        -- Check if they need welcome email (never received it before)
        needs_welcome := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        -- Return with both old and new field names for compatibility
        RETURN json_build_object(
            'success', true,
            'id', customer_record.id,
            'customer_id', customer_record.id,
            'email', customer_record.email,
            'first_name', customer_record.first_name,
            'last_name', customer_record.last_name,
            'phone', customer_record.phone,
            'temp_password', NULL,
            'existing_customer', true,
            'is_new', false,
            'needs_welcome_email', needs_welcome
        );
    ELSE
        -- New customer - create with temp password
        -- Generate a random 8-character temp password
        temp_password := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Insert new customer with temp password
        INSERT INTO customers (
            email, 
            password_hash, 
            first_name, 
            last_name, 
            phone, 
            welcome_email_sent,
            is_guest,
            created_at, 
            updated_at
        )
        VALUES (
            p_email, 
            crypt(temp_password, gen_salt('bf')), 
            p_first_name, 
            p_last_name, 
            p_phone,
            false,
            true,
            NOW(),
            NOW()
        )
        RETURNING id INTO customer_id;
        
        -- Return with both old and new field names for compatibility
        RETURN json_build_object(
            'success', true,
            'id', customer_id,
            'customer_id', customer_id,
            'email', p_email,
            'first_name', p_first_name,
            'last_name', p_last_name,
            'phone', p_phone,
            'temp_password', temp_password,
            'existing_customer', false,
            'is_new', true,
            'needs_welcome_email', true
        );
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition where customer was created between our check and insert
        SELECT * INTO customer_record FROM customers WHERE email = p_email;
        
        -- Check if they need welcome email
        needs_welcome := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'success', true,
            'id', customer_record.id,
            'customer_id', customer_record.id,
            'email', customer_record.email,
            'temp_password', NULL,
            'existing_customer', true,
            'is_new', false,
            'needs_welcome_email', needs_welcome
        );
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout customer: %', SQLERRM;
END;
$$;

-- ====================================
-- PART 3: CREATE mark_welcome_email_sent FUNCTION
-- ====================================

CREATE OR REPLACE FUNCTION public.mark_welcome_email_sent(customer_id UUID) 
RETURNS BOOLEAN
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE customers
    SET 
        welcome_email_sent = true,
        welcome_email_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = customer_id;
    
    RETURN FOUND;
END;
$$;

-- ====================================
-- PART 4: CREATE PASSWORD RESET FUNCTIONS
-- ====================================

-- Drop existing functions if they exist (to avoid parameter conflicts)
DROP FUNCTION IF EXISTS public.request_password_reset(text);
DROP FUNCTION IF EXISTS public.reset_password_with_token(text, text);

CREATE OR REPLACE FUNCTION public.request_password_reset(user_email text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  customer_record RECORD;
  reset_token_val TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Find the customer
  SELECT * INTO customer_record
  FROM customers 
  WHERE email = user_email 
    AND is_active = true;
  
  -- Always return success for security (don't reveal if email exists)
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'If account exists, reset email will be sent'
    );
  END IF;
  
  -- Generate a secure random token (32 characters)
  reset_token_val := array_to_string(
    ARRAY(
      SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 
                    ceil(random() * 62)::integer, 1)
      FROM generate_series(1, 32)
    ), 
    ''
  );
  
  -- Set expiration to 1 hour from now
  expires_at := NOW() + INTERVAL '1 hour';
  
  -- Store the token in the database
  UPDATE customers 
  SET 
    reset_token = reset_token_val,
    reset_token_expires = expires_at,
    updated_at = NOW()
  WHERE id = customer_record.id;
  
  -- Return success with token info
  RETURN json_build_object(
    'success', true,
    'token', reset_token_val,
    'expires_at', expires_at,
    'customer_email', user_email,
    'message', 'Reset token generated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An error occurred while processing password reset request'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_password_with_token(reset_token text, new_password text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  customer_record RECORD;
  rows_updated INTEGER;
  token_to_find TEXT;
  password_to_set TEXT;
BEGIN
  -- Copy parameters to local variables to avoid ambiguity
  token_to_find := reset_token;
  password_to_set := new_password;
  
  -- Find customer with valid reset token (using local variable)
  SELECT * INTO customer_record
  FROM customers 
  WHERE customers.reset_token = token_to_find
    AND customers.reset_token_expires > NOW()
    AND customers.is_active = true;
  
  -- Check if valid token found
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired reset token'
    );
  END IF;
  
  -- Update password_hash and clear reset token
  UPDATE customers 
  SET 
    password_hash = password_to_set,
    reset_token = NULL,
    reset_token_expires = NULL,
    updated_at = NOW(),
    password_change_required = false
  WHERE id = customer_record.id;
  
  -- Check if update was successful
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update password'
    );
  END IF;
  
  -- Return success with customer details for email confirmation
  RETURN json_build_object(
    'success', true,
    'message', 'Password updated successfully',
    'customer_email', customer_record.email,
    'customer_first_name', customer_record.first_name,
    'customer_last_name', customer_record.last_name
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An error occurred while resetting password'
    );
END;
$$;

-- ====================================
-- PART 5: CREATE update_customer_profile FUNCTION
-- ====================================

CREATE OR REPLACE FUNCTION public.update_customer_profile(
  customer_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_customer RECORD;
BEGIN
  -- Update the customer profile
  UPDATE customers
  SET
    first_name = p_first_name,
    last_name = p_last_name,
    email = p_email,
    phone = p_phone,
    date_of_birth = p_date_of_birth,
    gender = p_gender,
    updated_at = NOW()
  WHERE id = customer_id
  RETURNING * INTO updated_customer;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Customer not found'
    );
  END IF;
  
  -- Return success with updated customer data
  RETURN json_build_object(
    'success', true,
    'customer', json_build_object(
      'id', updated_customer.id,
      'first_name', updated_customer.first_name,
      'last_name', updated_customer.last_name,
      'email', updated_customer.email,
      'phone', updated_customer.phone,
      'date_of_birth', updated_customer.date_of_birth,
      'gender', updated_customer.gender
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update customer profile: ' || SQLERRM
    );
END;
$$;

-- ====================================
-- PART 6: GRANT EXECUTE PERMISSIONS
-- ====================================

GRANT EXECUTE ON FUNCTION public.create_checkout_customer(text, text, text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.mark_welcome_email_sent(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.request_password_reset(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.reset_password_with_token(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_customer_profile(UUID, TEXT, TEXT, TEXT, TEXT, DATE, TEXT) TO authenticated, anon;

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Verify columns were added
SELECT 
    'verification_columns' as check_type,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'customers'
    AND column_name IN ('welcome_email_sent', 'welcome_email_sent_at', 'reset_token', 'reset_token_expires')
ORDER BY column_name;

-- Verify functions were created
SELECT 
    'verification_functions' as check_type,
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'create_checkout_customer',
        'mark_welcome_email_sent',
        'request_password_reset',
        'reset_password_with_token',
        'update_customer_profile'
    )
ORDER BY routine_name;
