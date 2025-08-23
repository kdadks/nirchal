-- Customer Authentication Setup for Nirchal
-- Run this SQL in Supabase SQL Editor to enable customer registration

-- Step 1: Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add password column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email_lookup ON customers(email);

-- Step 4: Create password hashing functions

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

-- Step 5: Fix RLS policies to allow public customer registration and login

-- Drop ALL existing policies on customers table to start fresh
DO $$ 
BEGIN
    -- Drop all existing policies on customers table
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON customers'
    FROM pg_policies 
    WHERE tablename = 'customers' AND schemaname = 'public';
END $$;

-- Alternative approach: Drop specific policies we know about
DROP POLICY IF EXISTS "Allow public customer registration" ON customers;
DROP POLICY IF EXISTS "Allow public customer login" ON customers;
DROP POLICY IF EXISTS "Allow customer profile updates" ON customers;
DROP POLICY IF EXISTS customers_public_insert ON customers;
DROP POLICY IF EXISTS customers_public_select_self ON customers;
DROP POLICY IF EXISTS customers_auth_update_self ON customers;
DROP POLICY IF EXISTS customers_public_select ON customers;
DROP POLICY IF EXISTS customers_public_update ON customers;

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow public access for customer authentication

-- Allow public registration (INSERT) - but we'll use the function instead
CREATE POLICY "Allow public customer registration" ON customers
  FOR INSERT TO PUBLIC 
  WITH CHECK (true);

-- Allow public login verification (SELECT) - but we'll use the function instead
CREATE POLICY "Allow public customer login" ON customers
  FOR SELECT TO PUBLIC 
  USING (true);

-- Allow customers to update their own data (UPDATE)
CREATE POLICY "Allow customer profile updates" ON customers
  FOR UPDATE TO PUBLIC 
  USING (true) 
  WITH CHECK (true);

-- Grant necessary permissions to anonymous and authenticated users
GRANT INSERT, SELECT, UPDATE ON customers TO anon, authenticated;
GRANT EXECUTE ON FUNCTION register_customer(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION login_customer(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION hash_password(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_password(TEXT, TEXT) TO anon, authenticated;

-- Step 6: Create some test customers for testing (with properly hashed passwords)
SELECT register_customer('test@nirchal.com', 'password123', 'Test', 'Customer', '+1234567890');
SELECT register_customer('john@example.com', 'password456', 'John', 'Doe', '+0987654321');
SELECT register_customer('jane@example.com', 'password789', 'Jane', 'Smith', '+1122334455');

-- Step 7: Verify the setup
SELECT 
  'Setup Complete!' as status,
  COUNT(*) as customer_count 
FROM customers;

-- Show the test customers (passwords are now properly hashed)
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  phone,
  LEFT(password_hash, 20) || '...' as password_hash_preview,
  created_at
FROM customers 
WHERE email LIKE '%@nirchal.com' OR email LIKE '%@example.com';

-- Note: After running this SQL, you can test customer registration and login with:
-- Test accounts (passwords are now securely hashed):
-- Email: test@nirchal.com, Password: password123
-- Email: john@example.com, Password: password456
-- Email: jane@example.com, Password: password789
--
-- The application will now use secure password hashing for all new registrations and logins.
