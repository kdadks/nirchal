-- Update customer_addresses table to support comprehensive address management
-- Add new columns for phone, delivery/billing flags

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'phone') THEN
        ALTER TABLE customer_addresses ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;

-- Add is_shipping column if it doesn't exist (keep for backward compatibility, but now represents delivery)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'is_shipping') THEN
        ALTER TABLE customer_addresses ADD COLUMN is_shipping BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add is_billing column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'is_billing') THEN
        ALTER TABLE customer_addresses ADD COLUMN is_billing BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing addresses to have proper delivery/billing flags based on type
-- Note: is_shipping now represents delivery addresses
UPDATE customer_addresses 
SET is_shipping = (type = 'shipping' OR type = 'delivery' OR type = 'both'),
    is_billing = (type = 'billing' OR type = 'both')
WHERE is_shipping IS NULL OR is_billing IS NULL;

-- Create index for better performance on delivery/billing queries
CREATE INDEX IF NOT EXISTS idx_customer_addresses_delivery ON customer_addresses(customer_id, is_shipping) WHERE is_shipping = true;
CREATE INDEX IF NOT EXISTS idx_customer_addresses_billing ON customer_addresses(customer_id, is_billing) WHERE is_billing = true;

-- Add constraint to ensure at least one usage type is selected
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'customer_addresses' AND constraint_name = 'chk_address_usage') THEN
        ALTER TABLE customer_addresses 
        ADD CONSTRAINT chk_address_usage 
        CHECK (is_shipping = true OR is_billing = true);
    END IF;
END $$;
