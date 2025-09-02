-- Remove redundant type field from customer_addresses table
-- The type field is no longer needed since we have boolean fields for is_shipping, is_billing, and is_default

-- First, ensure all addresses have proper boolean flags set
UPDATE customer_addresses 
SET is_shipping = (type = 'shipping' OR type = 'delivery' OR type = 'both' OR type IS NULL),
    is_billing = (type = 'billing' OR type = 'both' OR type IS NULL)
WHERE is_shipping IS NULL OR is_billing IS NULL;

-- For addresses without specific type, default to both shipping and billing
UPDATE customer_addresses 
SET is_shipping = true,
    is_billing = true
WHERE type IS NULL OR type = '';

-- Add constraint to ensure only one default address per customer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'customer_addresses' AND constraint_name = 'unique_default_per_customer') THEN
        -- First, fix any duplicate defaults by keeping only the most recent one
        WITH ranked_defaults AS (
            SELECT id, customer_id, 
                   ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) as rn
            FROM customer_addresses 
            WHERE is_default = true
        )
        UPDATE customer_addresses 
        SET is_default = false 
        WHERE id IN (
            SELECT id FROM ranked_defaults WHERE rn > 1
        );
        
        -- Now add the unique constraint
        CREATE UNIQUE INDEX unique_default_per_customer 
        ON customer_addresses(customer_id) 
        WHERE is_default = true;
    END IF;
END $$;

-- Drop the redundant type column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'customer_addresses' AND column_name = 'type') THEN
        ALTER TABLE customer_addresses DROP COLUMN type;
    END IF;
END $$;
