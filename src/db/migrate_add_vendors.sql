-- Migration script to add vendor functionality to existing database
-- Run this if you already have a products table and want to add vendor support

-- 1. Create vendors table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Check if vendor_id column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'vendor_id'
    ) THEN
        ALTER TABLE products ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added vendor_id column to products table';
    ELSE
        RAISE NOTICE 'vendor_id column already exists in products table';
    END IF;
END $$;

-- 3. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- 4. Enable RLS if not already enabled
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (will skip if they already exist)
DO $$ 
BEGIN
    -- Drop existing policies if they exist to recreate them
    DROP POLICY IF EXISTS "Enable read access for all users" ON vendors;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON vendors;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON vendors;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON vendors;
    
    -- Create new policies
    CREATE POLICY "Enable read access for all users" ON vendors FOR SELECT USING (true);
    CREATE POLICY "Enable insert for authenticated users only" ON vendors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Enable update for authenticated users only" ON vendors FOR UPDATE USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable delete for authenticated users only" ON vendors FOR DELETE USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'RLS policies created for vendors table';
END $$;

-- 6. Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant permissions
GRANT ALL ON vendors TO authenticated;
GRANT ALL ON vendors TO anon;

-- 8. Insert sample vendors (only if table is empty)
INSERT INTO vendors (name, description, email, phone, website, is_active) 
SELECT * FROM (VALUES
    ('Acme Corporation', 'Premium supplier of quality products', 'contact@acme.com', '+1-555-0123', 'https://acme.com', true),
    ('Global Supplies Inc.', 'International supplier with wide range of products', 'info@globalsupplies.com', '+1-555-0456', 'https://globalsupplies.com', true),
    ('Local Vendor Co.', 'Local supplier specializing in regional products', 'hello@localvendor.com', '+1-555-0789', 'https://localvendor.com', true),
    ('Premium Products Ltd.', 'High-end product manufacturer', 'sales@premiumproducts.com', '+1-555-0321', 'https://premiumproducts.com', true),
    ('Budget Supplies', 'Affordable products for every need', 'support@budgetsupplies.com', '+1-555-0654', 'https://budgetsupplies.com', false)
) AS sample_vendors(name, description, email, phone, website, is_active)
WHERE NOT EXISTS (SELECT 1 FROM vendors LIMIT 1);

-- Success message
SELECT 
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM vendors) as vendor_count,
    'Vendor functionality is now available in your admin panel' as message;
