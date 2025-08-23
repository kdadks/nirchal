-- Add password column to customers table for customer authentication
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email_lookup ON customers(email);

-- Add some sample customers for testing (with plain text passwords - NOT for production!)
INSERT INTO customers (email, password_hash, first_name, last_name, phone) 
VALUES 
  ('test@example.com', 'password123', 'Test', 'User', '+1234567890'),
  ('john@example.com', 'password456', 'John', 'Doe', '+0987654321')
ON CONFLICT (email) DO NOTHING;
