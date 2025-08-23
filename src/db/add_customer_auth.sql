-- Add password authentication to customers table
-- Remove dependency on Supabase auth for customer accounts

-- Add password field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Remove the user_id foreign key constraint since customers won't use Supabase auth
ALTER TABLE customers DROP COLUMN IF EXISTS user_id;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON customers(reset_token);

-- Update RLS policies for customer authentication
-- Allow customers to read their own data based on email (since we'll store email in session)
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
CREATE POLICY "Customers can view own data" ON customers
    FOR SELECT USING (email = current_setting('app.current_customer_email', true));

-- Allow customers to update their own data
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
CREATE POLICY "Customers can update own data" ON customers
    FOR UPDATE USING (email = current_setting('app.current_customer_email', true));

-- Allow public registration (insert)
DROP POLICY IF EXISTS "Allow customer registration" ON customers;
CREATE POLICY "Allow customer registration" ON customers
    FOR INSERT WITH CHECK (true);

-- Update customer_addresses policies
DROP POLICY IF EXISTS "Customers can view own addresses" ON customer_addresses;
CREATE POLICY "Customers can view own addresses" ON customer_addresses
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers 
            WHERE email = current_setting('app.current_customer_email', true)
        )
    );

DROP POLICY IF EXISTS "Customers can manage own addresses" ON customer_addresses;
CREATE POLICY "Customers can manage own addresses" ON customer_addresses
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM customers 
            WHERE email = current_setting('app.current_customer_email', true)
        )
    );

-- Update orders policies
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers 
            WHERE email = current_setting('app.current_customer_email', true)
        )
    );

-- Update order_items policies
DROP POLICY IF EXISTS "Customers can view own order items" ON order_items;
CREATE POLICY "Customers can view own order items" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT o.id FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.email = current_setting('app.current_customer_email', true)
        )
    );

-- Create function to hash passwords (using pgcrypto extension)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for customer login
CREATE OR REPLACE FUNCTION customer_login(user_email TEXT, user_password TEXT)
RETURNS JSON AS $$
DECLARE
    customer_record customers%ROWTYPE;
    result JSON;
BEGIN
    -- Check for too many failed attempts
    SELECT * INTO customer_record FROM customers 
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
    
    -- Check if account is locked
    IF customer_record.locked_until IS NOT NULL AND customer_record.locked_until > NOW() THEN
        RETURN json_build_object('success', false, 'error', 'Account is temporarily locked. Please try again later.');
    END IF;
    
    -- Verify password
    IF verify_password(user_password, customer_record.password_hash) THEN
        -- Reset login attempts on successful login
        UPDATE customers 
        SET login_attempts = 0, locked_until = NULL 
        WHERE id = customer_record.id;
        
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
        -- Increment login attempts
        UPDATE customers 
        SET login_attempts = login_attempts + 1,
            locked_until = CASE 
                WHEN login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
                ELSE NULL 
            END
        WHERE id = customer_record.id;
        
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for customer registration
CREATE OR REPLACE FUNCTION customer_register(
    user_email TEXT,
    user_password TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    customer_id BIGINT;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM customers WHERE email = user_email) THEN
        RETURN json_build_object('success', false, 'error', 'Email already registered');
    END IF;
    
    -- Insert new customer
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate password reset token
CREATE OR REPLACE FUNCTION generate_reset_token(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    reset_token TEXT;
    customer_record customers%ROWTYPE;
BEGIN
    SELECT * INTO customer_record FROM customers WHERE email = user_email;
    
    IF NOT FOUND THEN
        -- Return success even if email not found (security)
        RETURN json_build_object('success', true, 'message', 'If email exists, reset link will be sent');
    END IF;
    
    -- Generate random token
    reset_token := encode(gen_random_bytes(32), 'hex');
    
    -- Update customer with reset token
    UPDATE customers 
    SET reset_token = reset_token, 
        reset_token_expires = NOW() + INTERVAL '1 hour'
    WHERE email = user_email;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'If email exists, reset link will be sent',
        'token', reset_token  -- In production, this would be sent via email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset password with token
CREATE OR REPLACE FUNCTION reset_password_with_token(token TEXT, new_password TEXT)
RETURNS JSON AS $$
DECLARE
    customer_record customers%ROWTYPE;
BEGIN
    SELECT * INTO customer_record FROM customers 
    WHERE reset_token = token AND reset_token_expires > NOW();
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or expired reset token');
    END IF;
    
    -- Update password and clear reset token
    UPDATE customers 
    SET password_hash = hash_password(new_password),
        reset_token = NULL,
        reset_token_expires = NULL,
        login_attempts = 0,
        locked_until = NULL
    WHERE id = customer_record.id;
    
    RETURN json_build_object('success', true, 'message', 'Password reset successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
