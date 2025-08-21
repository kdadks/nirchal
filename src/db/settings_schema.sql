-- Settings System Database Schema
-- This will store all application settings in a flexible key-value structure

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- 'shop', 'payment', 'billing', 'seo', etc.
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(category, key)
);

-- Add data_type column if it doesn't exist (for existing tables)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'data_type'
    ) THEN
        ALTER TABLE settings ADD COLUMN data_type VARCHAR(20) DEFAULT 'string';
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_encrypted'
    ) THEN
        ALTER TABLE settings ADD COLUMN is_encrypted BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_required'
    ) THEN
        ALTER TABLE settings ADD COLUMN is_required BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'default_value'
    ) THEN
        ALTER TABLE settings ADD COLUMN default_value TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'validation_rules'
    ) THEN
        ALTER TABLE settings ADD COLUMN validation_rules JSONB;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE settings ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE settings ADD COLUMN updated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create settings categories table
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

-- Ensure unique constraint exists on settings table
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_category_key_key;
ALTER TABLE settings ADD CONSTRAINT settings_category_key_key UNIQUE (category, key);

-- Insert default categories
INSERT INTO settings_categories (name, label, description, icon, display_order) VALUES
('shop', 'Shop Settings', 'Basic store information and configuration', 'Store', 1),
('payment', 'Payment Gateway', 'Payment gateway configurations', 'CreditCard', 2),
('billing', 'Billing', 'Tax and billing settings', 'Receipt', 3),
('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default shop settings
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

-- Payment Gateway Settings
('payment', 'razorpay_enabled', 'true', 'boolean', 'Enable Razorpay payments', false, 'false'),
('payment', 'razorpay_key_id', '', 'string', 'Razorpay Key ID', false, ''),
('payment', 'razorpay_key_secret', '', 'string', 'Razorpay Key Secret', true, ''),
('payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payments', false, 'false'),
('payment', 'stripe_publishable_key', '', 'string', 'Stripe Publishable Key', false, ''),
('payment', 'stripe_secret_key', '', 'string', 'Stripe Secret Key', true, ''),
('payment', 'paypal_enabled', 'false', 'boolean', 'Enable PayPal payments', false, 'false'),
('payment', 'paypal_client_id', '', 'string', 'PayPal Client ID', false, ''),
('payment', 'paypal_client_secret', '', 'string', 'PayPal Client Secret', true, ''),
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
('seo', 'og_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'Open Graph title', false, ''),
('seo', 'og_description', 'Discover exquisite Indian ethnic wear at Nirchal', 'string', 'Open Graph description', false, ''),
('seo', 'og_image', '', 'string', 'Open Graph image URL', false, ''),
('seo', 'twitter_card', 'summary_large_image', 'string', 'Twitter card type', false, 'summary_large_image'),
('seo', 'canonical_url', 'https://nirchal.com', 'string', 'Canonical URL', false, ''),
('seo', 'robots_index', 'true', 'boolean', 'Allow search engine indexing', false, 'true'),
('seo', 'robots_follow', 'true', 'boolean', 'Allow search engines to follow links', false, 'true'),
('seo', 'enable_sitemap', 'true', 'boolean', 'Enable XML sitemap', false, 'true'),
('seo', 'google_analytics_id', '', 'string', 'Google Analytics ID', false, ''),
('seo', 'facebook_pixel_id', '', 'string', 'Facebook Pixel ID', false, '')
ON CONFLICT (category, key) DO NOTHING;

-- Mark sensitive fields as encrypted
UPDATE settings SET is_encrypted = true WHERE key IN (
    'razorpay_key_secret', 
    'stripe_secret_key', 
    'paypal_client_secret'
);

-- Create function to get settings by category
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

-- Create function to update setting
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow read access to settings categories" ON settings_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON settings_categories TO anon, authenticated;
GRANT UPDATE ON settings TO authenticated;

COMMENT ON TABLE settings IS 'Application settings stored as key-value pairs';
COMMENT ON TABLE settings_categories IS 'Settings categories for organization';
COMMENT ON FUNCTION get_settings_by_category(TEXT) IS 'Get all settings for a specific category';
COMMENT ON FUNCTION update_setting(TEXT, TEXT, TEXT, UUID) IS 'Update a specific setting value';
