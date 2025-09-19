# Password Reset Setup Guide

This guide will help you set up the password reset functionality in your Supabase database.

## Manual Database Setup

### Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Create a new query

### Step 2: Execute the Setup SQL

Copy and paste the entire contents of `setup-password-reset.sql` into the SQL Editor and click **Run**.

**Important:** The SQL script includes `DROP FUNCTION IF EXISTS` statements to handle any existing functions with the same names. This ensures a clean setup even if you've run the script before.

Alternatively, you can execute the SQL statements one by one:

### Quick Setup (Essential SQL)

If you prefer to copy-paste smaller chunks, here are the essential parts:

#### 1. Create the password_reset_tokens table:
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_customer_id ON password_reset_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');
```

#### 2. Create the token generation function:
```sql
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
```

#### 3. Create the password reset request function:
```sql
CREATE OR REPLACE FUNCTION request_password_reset(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    customer_record RECORD;
    reset_token TEXT;
    token_expires TIMESTAMPTZ;
BEGIN
    SELECT id, email, first_name, last_name INTO customer_record
    FROM customers
    WHERE email = trim(lower(user_email));
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', true, 'message', 'If account exists, reset email will be sent');
    END IF;
    
    UPDATE password_reset_tokens 
    SET used_at = NOW()
    WHERE customer_id = customer_record.id 
    AND expires_at > NOW() 
    AND used_at IS NULL;
    
    reset_token := generate_password_reset_token();
    token_expires := NOW() + INTERVAL '1 hour';
    
    INSERT INTO password_reset_tokens (customer_id, token, expires_at)
    VALUES (customer_record.id, reset_token, token_expires);
    
    RETURN json_build_object(
        'success', true,
        'token', reset_token,
        'expires_at', token_expires,
        'customer_email', customer_record.email
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Password reset request error: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', 'Failed to process password reset request');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 4. Create the password reset function:
```sql
CREATE OR REPLACE FUNCTION reset_password_with_token(reset_token TEXT, new_password TEXT)
RETURNS JSON AS $$
DECLARE
    token_record RECORD;
BEGIN
    SELECT prt.id, prt.customer_id, prt.expires_at, prt.used_at,
           c.email, c.first_name, c.last_name
    INTO token_record
    FROM password_reset_tokens prt
    JOIN customers c ON prt.customer_id = c.id
    WHERE prt.token = reset_token
    AND prt.expires_at > NOW()
    AND prt.used_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or expired reset token');
    END IF;
    
    UPDATE customers 
    SET password_hash = new_password,
        updated_at = NOW()
    WHERE id = token_record.customer_id;
    
    UPDATE password_reset_tokens 
    SET used_at = NOW(),
        updated_at = NOW()
    WHERE id = token_record.id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Password updated successfully',
        'customer_email', token_record.email
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Password reset error: %', SQLERRM;
    RETURN json_build_object('success', false, 'error', 'Failed to reset password');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Test the Setup

After running the SQL, you can test if it's working by executing this test query in the SQL Editor:

```sql
SELECT request_password_reset('test@example.com');
```

You should see a JSON response indicating success.

## Frontend Implementation

The frontend implementation is now complete with:

- ✅ **ResetPasswordPage** - `/reset-password?token=...` handles password reset flow
- ✅ **Updated CustomerAuthContext** - Proper integration with database functions
- ✅ **Email Integration** - Password reset emails with secure tokens
- ✅ **Password Encryption** - Proper bcrypt hashing for new passwords

## How It Works

1. **User requests password reset** → Email sent with secure token link
2. **User clicks email link** → Redirected to `/reset-password?token=ABC123...`
3. **User enters new password** → Frontend hashes password with bcrypt
4. **Token validated** → Database updates password and marks token as used
5. **Success** → User redirected to login with new password

## Security Features

- ✅ **Secure tokens** - 32-character random strings
- ✅ **Token expiration** - 1-hour validity period
- ✅ **One-time use** - Tokens marked as used after successful reset
- ✅ **Password hashing** - bcrypt with 12 salt rounds
- ✅ **Email verification** - Only sent to existing customer emails
- ✅ **Token invalidation** - Old tokens invalidated when new ones are requested

## Maintenance

Consider setting up a periodic cleanup of expired tokens:

```sql
SELECT cleanup_expired_password_reset_tokens();
```

This can be run daily via a cron job or Supabase Function.