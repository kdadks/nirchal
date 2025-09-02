-- Add welcome_email_sent tracking to customers table
-- This prevents duplicate welcome emails for customers

-- Add welcome_email_sent column to track if customer has received welcome email
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

-- Add welcome_email_sent_at timestamp to track when welcome email was sent
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_welcome_email_sent ON customers(welcome_email_sent);

-- Update the create_checkout_customer function to handle welcome email tracking
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
    needs_welcome_email BOOLEAN := false;
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
        
        -- Check if they need a welcome email (if they haven't received one)
        needs_welcome_email := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'id', customer_record.id,
            'temp_password', NULL,
            'existing_customer', true,
            'needs_welcome_email', needs_welcome_email
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
            hash_password(temp_password), 
            p_first_name, 
            p_last_name, 
            p_phone,
            false, -- Will be set to true after email is sent
            NOW(),
            NOW()
        )
        RETURNING id INTO customer_id;
        
        RETURN json_build_object(
            'id', customer_id,
            'temp_password', temp_password,
            'existing_customer', false,
            'needs_welcome_email', true
        );
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        -- Handle race condition where customer was created between our check and insert
        SELECT * INTO customer_record FROM customers WHERE email = p_email;
        needs_welcome_email := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'id', customer_record.id,
            'temp_password', NULL,
            'existing_customer', true,
            'needs_welcome_email', needs_welcome_email
        );
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout customer: %', SQLERRM;
END;
$$;

-- Function to mark welcome email as sent
CREATE OR REPLACE FUNCTION mark_welcome_email_sent(customer_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION mark_welcome_email_sent(BIGINT) TO anon, authenticated;
