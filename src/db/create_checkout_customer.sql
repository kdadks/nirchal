-- Create function to handle checkout customer creation with temp password logic
-- This function properly handles:
-- 1. Existing customers (no temp password needed)
-- 2. New customers from checkout (generate temp password and send welcome email with it)
-- 3. Prevents duplicate welcome emails

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
    temp_password TEXT;
    customer_id BIGINT;
    is_existing_customer BOOLEAN := false;
BEGIN
    -- Check if customer already exists
    SELECT * INTO customer_record FROM customers 
    WHERE email = p_email;
    
    IF FOUND THEN
        -- Existing customer - update their info if needed and return without temp password
        UPDATE customers 
        SET 
            first_name = COALESCE(p_first_name, first_name),
            last_name = COALESCE(p_last_name, last_name),
            phone = COALESCE(p_phone, phone),
            updated_at = NOW()
        WHERE id = customer_record.id;
        
        RETURN json_build_object(
            'id', customer_record.id,
            'temp_password', NULL,
            'existing_customer', true
        );
    ELSE
        -- New customer - create with temp password
        -- Generate a random 8-character temp password
        temp_password := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Insert new customer with temp password
        INSERT INTO customers (email, password_hash, first_name, last_name, phone, created_at, updated_at)
        VALUES (
            p_email, 
            hash_password(temp_password), 
            p_first_name, 
            p_last_name, 
            p_phone,
            NOW(),
            NOW()
        )
        RETURNING id INTO customer_id;
        
        RETURN json_build_object(
            'id', customer_id,
            'temp_password', temp_password,
            'existing_customer', false
        );
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition where customer was created between our check and insert
        SELECT id INTO customer_id FROM customers WHERE email = p_email;
        RETURN json_build_object(
            'id', customer_id,
            'temp_password', NULL,
            'existing_customer', true
        );
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout customer: %', SQLERRM;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_checkout_customer(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Test the function
-- SELECT create_checkout_customer('test@checkout.com', 'Test', 'Checkout', '+1234567890');
