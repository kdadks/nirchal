-- Add Vendors table and update Products table with vendor support
-- Run this script to add vendor functionality to your database

-- 1. Create vendors table
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

-- 2. Add vendor_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);

-- 4. Insert some sample vendors
INSERT INTO vendors (name, description, email, phone, website, is_active) VALUES
('Acme Corporation', 'Premium supplier of quality products', 'contact@acme.com', '+1-555-0123', 'https://acme.com', true),
('Global Supplies Inc.', 'International supplier with wide range of products', 'info@globalsupplies.com', '+1-555-0456', 'https://globalsupplies.com', true),
('Local Vendor Co.', 'Local supplier specializing in regional products', 'hello@localvendor.com', '+1-555-0789', 'https://localvendor.com', true),
('Premium Products Ltd.', 'High-end product manufacturer', 'sales@premiumproducts.com', '+1-555-0321', 'https://premiumproducts.com', true),
('Budget Supplies', 'Affordable products for every need', 'support@budgetsupplies.com', '+1-555-0654', 'https://budgetsupplies.com', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS (Row Level Security) for vendors table
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for vendors table
CREATE POLICY "Enable read access for all users" ON vendors FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON vendors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON vendors FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON vendors FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Create updated_at trigger for vendors table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant necessary permissions
GRANT ALL ON vendors TO authenticated;
GRANT ALL ON vendors TO anon;

-- Success message
SELECT 'Vendors table created successfully! You can now manage vendors in your admin panel.' as message;
