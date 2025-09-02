-- Add welcome email tracking fields to customers table
-- This is a simpler version that can be run manually in Supabase SQL editor

-- Add the welcome_email_sent column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

-- Add the welcome_email_sent_at column if it doesn't exist  
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_welcome_email_sent ON customers(welcome_email_sent);

-- Update existing customers to have welcome_email_sent = false if null
UPDATE customers 
SET welcome_email_sent = false 
WHERE welcome_email_sent IS NULL;
