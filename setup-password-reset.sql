-- Password Reset System Implementation
-- This script creates the necessary tables and functions for password reset functionality

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_customer_id ON password_reset_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add RLS policy for password_reset_tokens
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage tokens
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Function to generate secure random token
CREATE OR REPLACE FUNCTION generate_password_reset_token() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..32 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request password reset
DROP FUNCTION IF EXISTS request_password_reset(TEXT);

CREATE OR REPLACE FUNCTION request_password_reset(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    customer_record RECORD;
    reset_token TEXT;
    token_expires TIMESTAMPTZ;
BEGIN
    -- Find customer by email
    SELECT id, email, first_name, last_name INTO customer_record
    FROM customers
    WHERE email = trim(lower(user_email));
    
    -- If customer not found, return success for security (don't reveal if email exists)
    IF NOT FOUND THEN
        RETURN json_build_object('success', true, 'message', 'If account exists, reset email will be sent');
    END IF;
    
    -- Invalidate any existing tokens for this customer
    UPDATE password_reset_tokens 
    SET used_at = NOW()
    WHERE customer_id = customer_record.id 
    AND expires_at > NOW() 
    AND used_at IS NULL;
    
    -- Generate new token
    reset_token := generate_password_reset_token();
    token_expires := NOW() + INTERVAL '1 hour'; -- Token expires in 1 hour
    
    -- Insert new reset token
    INSERT INTO password_reset_tokens (customer_id, token, expires_at)
    VALUES (customer_record.id, reset_token, token_expires);
    
    -- Return success with token
    RETURN json_build_object(
        'success', true,
        'token', reset_token,
        'expires_at', token_expires,
        'customer_email', customer_record.email
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure
    RAISE LOG 'Password reset request error: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', 'Failed to process password reset request');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset password with token
DROP FUNCTION IF EXISTS reset_password_with_token(TEXT, TEXT);

CREATE OR REPLACE FUNCTION reset_password_with_token(reset_token TEXT, new_password TEXT)
RETURNS JSON AS $$
DECLARE
    token_record RECORD;
    customer_record RECORD;
BEGIN
    -- Find valid, unused token
    SELECT prt.id, prt.customer_id, prt.expires_at, prt.used_at,
           c.email, c.first_name, c.last_name
    INTO token_record
    FROM password_reset_tokens prt
    JOIN customers c ON prt.customer_id = c.id
    WHERE prt.token = reset_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;
    
    -- Check if token is valid
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or expired reset token');
    END IF;
    
    -- Update customer password (assumes new_password is already hashed)
    UPDATE customers 
    SET password_hash = new_password,
        updated_at = NOW()
    WHERE id = token_record.customer_id;
    
    -- Mark token as used
    UPDATE password_reset_tokens 
    SET used_at = NOW(),
        updated_at = NOW()
    WHERE id = token_record.id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'Password updated successfully',
        'customer_email', token_record.email
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure
    RAISE LOG 'Password reset error: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', 'Failed to reset password');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() - INTERVAL '24 hours'; -- Keep expired tokens for 24 hours for debugging
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION request_password_reset(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION reset_password_with_token(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_password_reset_tokens() TO service_role;
GRANT EXECUTE ON FUNCTION generate_password_reset_token() TO service_role;