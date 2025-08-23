-- Simple Customer Authentication Update
-- Run this if you're getting policy conflicts with the main setup file

-- Step 1: Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add password column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Step 3: Create password hashing functions (replace if they exist)

-- Function to hash passwords using bcrypt
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN extensions.crypt(password, extensions.gen_salt('bf', 10));
END;
$$;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN hash = extensions.crypt(password, hash);
END;
$$;

-- Function for secure customer registration
CREATE OR REPLACE FUNCTION register_customer(
    user_email TEXT,
    user_password TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    customer_id customers.id%TYPE;
BEGIN
    -- Insert new customer; rely on unique constraint and handle cleanly
    INSERT INTO customers (email, password_hash, first_name, last_name, phone)
    VALUES (user_email, hash_password(user_password), user_first_name, user_last_name, user_phone)
    RETURNING id INTO customer_id;
    
    RETURN json_build_object(
        'success', true,
        'customer', json_build_object(
            'id', customer_id,
            'email', user_email,
            'first_name', user_first_name,
            'last_name', user_last_name,
            'phone', user_phone
        )
    );
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'Email already registered');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Registration failed', 'detail', SQLERRM);
END;
$$;

-- Function for secure customer login
CREATE OR REPLACE FUNCTION login_customer(user_email TEXT, user_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    customer_record customers%ROWTYPE;
BEGIN
    -- Get customer by email
    SELECT * INTO customer_record FROM customers 
    WHERE email = user_email AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
    
    -- Verify password
    IF verify_password(user_password, customer_record.password_hash) THEN
        RETURN json_build_object(
            'success', true,
            'customer', json_build_object(
                'id', customer_record.id,
                'email', customer_record.email,
                'first_name', customer_record.first_name,
                'last_name', customer_record.last_name,
                'phone', customer_record.phone
            )
        );
    ELSE
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Login failed', 'detail', SQLERRM);
END;
$$;

-- Step 4: Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON customers TO anon, authenticated;
GRANT EXECUTE ON FUNCTION register_customer(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION login_customer(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO anon, authenticated;

-- Step 5: Test the functions (optional)
-- Uncomment these lines if you want to create test customers:
-- SELECT register_customer('test@nirchal.com', 'password123', 'Test', 'Customer', '+1234567890');
-- SELECT login_customer('test@nirchal.com', 'password123');

SELECT 'Customer authentication functions updated successfully!' as status;
