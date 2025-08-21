-- Step-by-Step Settings Table Migration
-- Run these commands one by one in Supabase SQL Editor

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns (run each ALTER TABLE separately)
-- Add data_type column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS data_type VARCHAR(20) DEFAULT 'string';

-- Add is_encrypted column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false;

-- Add is_required column  
ALTER TABLE settings ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false;

-- Add default_value column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_value TEXT;

-- Add validation_rules column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS validation_rules JSONB;

-- Add created_by column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add updated_by column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Step 3: Create settings_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Insert categories
INSERT INTO settings_categories (name, label, description, icon, display_order) VALUES
('shop', 'Shop Settings', 'Basic store information and configuration', 'Store', 1),
('payment', 'Payment Gateway', 'Payment gateway configurations', 'CreditCard', 2),
('billing', 'Billing', 'Tax and billing settings', 'Receipt', 3),
('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 4)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Insert basic settings (modify values as needed)
INSERT INTO settings (category, key, value, data_type, description, is_required, default_value) VALUES
-- Shop Settings
('shop', 'store_name', 'Nirchal', 'string', 'Store display name', true, 'Nirchal'),
('shop', 'store_email', 'contact@nirchal.com', 'string', 'Store contact email', true, ''),
('shop', 'store_phone', '+91 98765 43210', 'string', 'Store contact phone', false, ''),
('shop', 'store_address', 'Mumbai, Maharashtra, India', 'string', 'Store physical address', false, ''),
('shop', 'store_description', 'Premium Indian ethnic wear for the modern woman', 'string', 'Store description', false, ''),
('shop', 'currency', 'INR', 'string', 'Store currency', true, 'INR'),
('shop', 'timezone', 'Asia/Kolkata', 'string', 'Store timezone', true, 'Asia/Kolkata'),
('shop', 'allow_guest_checkout', 'true', 'boolean', 'Allow checkout without registration', false, 'true'),
('shop', 'auto_approve_reviews', 'false', 'boolean', 'Automatically approve product reviews', false, 'false'),
('shop', 'low_stock_threshold', '10', 'number', 'Low stock alert threshold', false, '10'),
('shop', 'order_prefix', 'ORD', 'string', 'Order number prefix', false, 'ORD'),
('shop', 'enable_inventory_tracking', 'true', 'boolean', 'Enable inventory tracking', false, 'true'),

-- Payment Settings
('payment', 'razorpay_enabled', 'true', 'boolean', 'Enable Razorpay payments', false, 'false'),
('payment', 'razorpay_key_id', '', 'string', 'Razorpay Key ID', false, ''),
('payment', 'razorpay_key_secret', '', 'string', 'Razorpay Key Secret', false, ''),
('payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payments', false, 'false'),
('payment', 'stripe_publishable_key', '', 'string', 'Stripe Publishable Key', false, ''),
('payment', 'stripe_secret_key', '', 'string', 'Stripe Secret Key', false, ''),
('payment', 'cod_enabled', 'true', 'boolean', 'Enable Cash on Delivery', false, 'true'),

-- Billing Settings
('billing', 'gst_number', '', 'string', 'GST Registration Number', false, ''),
('billing', 'pan_number', '', 'string', 'PAN Number', false, ''),
('billing', 'company_name', 'Nirchal Fashion Pvt Ltd', 'string', 'Legal company name', false, ''),
('billing', 'billing_address', 'Mumbai, Maharashtra, India', 'string', 'Billing address', false, ''),
('billing', 'invoice_prefix', 'INV', 'string', 'Invoice number prefix', false, 'INV'),
('billing', 'tax_rate', '18', 'number', 'Default tax rate (%)', false, '18'),
('billing', 'enable_gst', 'true', 'boolean', 'Enable GST calculation', false, 'true'),

-- SEO Settings
('seo', 'site_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'Default page title', true, ''),
('seo', 'meta_description', 'Discover exquisite Indian ethnic wear at Nirchal. Premium sarees, lehengas, and traditional outfits for the modern woman.', 'string', 'Default meta description', false, ''),
('seo', 'meta_keywords', 'indian ethnic wear, sarees, lehengas, traditional clothing, ethnic fashion', 'string', 'Default meta keywords', false, ''),
('seo', 'canonical_url', 'https://nirchal.com', 'string', 'Canonical URL', false, ''),
('seo', 'robots_index', 'true', 'boolean', 'Allow search engine indexing', false, 'true'),
('seo', 'robots_follow', 'true', 'boolean', 'Allow search engines to follow links', false, 'true'),
('seo', 'enable_sitemap', 'true', 'boolean', 'Enable XML sitemap', false, 'true'),
('seo', 'google_analytics_id', '', 'string', 'Google Analytics ID', false, ''),
('seo', 'facebook_pixel_id', '', 'string', 'Facebook Pixel ID', false, '')
ON CONFLICT (category, key) DO NOTHING;

-- Step 6: Mark sensitive fields as encrypted
UPDATE settings SET is_encrypted = true WHERE key IN (
    'razorpay_key_secret', 
    'stripe_secret_key', 
    'paypal_client_secret'
);

-- Step 7: Create helpful functions
CREATE OR REPLACE FUNCTION get_settings_by_category(category_name TEXT)
RETURNS TABLE (
    key TEXT,
    value TEXT,
    data_type TEXT,
    description TEXT,
    is_required BOOLEAN,
    default_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.key::TEXT,
        s.value::TEXT,
        s.data_type::TEXT,
        s.description::TEXT,
        s.is_required,
        s.default_value::TEXT
    FROM settings s
    WHERE s.category = category_name
    ORDER BY s.key;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_setting(
    p_category TEXT,
    p_key TEXT,
    p_value TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE settings 
    SET 
        value = p_value,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE category = p_category AND key = p_key;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);

-- Step 9: Enable RLS and create policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow read access to settings categories" ON settings_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

-- Create new policies
CREATE POLICY "Allow read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow read access to settings categories" ON settings_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 10: Grant permissions
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON settings_categories TO anon, authenticated;
GRANT UPDATE ON settings TO authenticated;

-- Step 11: Verify the setup
SELECT 'Settings Categories' as table_name, COUNT(*) as count FROM settings_categories
UNION ALL
SELECT 'Settings' as table_name, COUNT(*) as count FROM settings;

-- Step 12: Show settings by category
SELECT category, COUNT(*) as settings_count 
FROM settings 
GROUP BY category 
ORDER BY category;
