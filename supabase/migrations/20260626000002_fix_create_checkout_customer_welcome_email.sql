-- Fix create_checkout_customer to return needs_welcome_email field
-- This field is required for the welcome email logic to work properly

DROP FUNCTION IF EXISTS public.create_checkout_customer(text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_checkout_customer(
    p_email text, 
    p_first_name text, 
    p_last_name text, 
    p_phone text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    customer_record customers%ROWTYPE;
    temp_password TEXT;
    customer_id UUID;
    is_existing_customer BOOLEAN := false;
    needs_email BOOLEAN := false;
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
        needs_email := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'customer_id', customer_record.id,
            'id', customer_record.id,
            'temp_password', NULL,
            'existing_customer', true,
            'needs_welcome_email', needs_email,
            'is_new', false
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
            created_at,
            updated_at
        )
        VALUES (
            p_email, 
            crypt(temp_password, gen_salt('bf')), 
            p_first_name, 
            p_last_name, 
            p_phone,
            false,  -- Will be set to true after email is sent
            NOW(),
            NOW()
        )
        RETURNING id INTO customer_id;
        
        RETURN json_build_object(
            'customer_id', customer_id,
            'id', customer_id,
            'temp_password', temp_password,
            'existing_customer', false,
            'needs_welcome_email', true,
            'is_new', true
        );
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition where customer was created between our check and insert
        SELECT * INTO customer_record FROM customers WHERE email = p_email;
        needs_email := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'customer_id', customer_record.id,
            'id', customer_record.id,
            'temp_password', NULL,
            'existing_customer', true,
            'needs_welcome_email', needs_email,
            'is_new', false
        );
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout customer: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_checkout_customer(text, text, text, text) TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION public.create_checkout_customer(text, text, text, text) IS 
'Create or update customer during checkout with temp password for new customers. Returns needs_welcome_email flag to control email sending.';
