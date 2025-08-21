-- Compatible Settings Migration Script
-- This script works with the existing settings table structure
-- which has UNIQUE(key) instead of UNIQUE(category, key)

-- Step 1: Add missing columns to existing settings table
DO $$ 
BEGIN 
    -- Add type column (if it doesn't exist) with default value
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN type VARCHAR(20) DEFAULT 'string' NOT NULL;
    END IF;
    
    -- Add category column (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'category' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN category VARCHAR(50) DEFAULT 'general' NOT NULL;
    END IF;
    
    -- Add data_type column (for compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'data_type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN data_type VARCHAR(20) DEFAULT 'string';
    END IF;
    
    -- Add description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'description' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN description TEXT;
    END IF;
    
    -- Add is_encrypted column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_encrypted' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN is_encrypted BOOLEAN DEFAULT false;
    END IF;
    
    -- Add is_required column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'is_required' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN is_required BOOLEAN DEFAULT false;
    END IF;
    
    -- Add default_value column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'default_value' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN default_value TEXT;
    END IF;
    
    -- Add validation_rules column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'validation_rules' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN validation_rules JSONB;
    END IF;
    
    -- Update data_type column to match type column for existing rows
    UPDATE settings SET data_type = type WHERE data_type IS NULL OR data_type = '';
END $$;

-- Step 2: Create settings categories table
CREATE TABLE IF NOT EXISTS settings_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add unique constraint to categories table safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'settings_categories' 
        AND constraint_name = 'settings_categories_name_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings_categories ADD CONSTRAINT settings_categories_name_key UNIQUE (name);
    END IF;
END $$;

-- Step 4: Insert categories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'shop') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('shop', 'Shop Settings', 'Basic store information and configuration', 'Store', 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'payment') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('payment', 'Payment Gateway', 'Payment gateway configurations', 'CreditCard', 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'billing') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('billing', 'Billing', 'Tax and billing settings', 'Receipt', 3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'seo') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 4);
    END IF;
END $$;

-- Step 5: Insert settings with unique keys (since UNIQUE constraint is on key only)
DO $$
BEGIN
    -- Shop Settings (using prefixed keys to ensure uniqueness)
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'shop_store_name') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'shop_store_name', 'Nirchal', 'string', 'string', 'Store display name', true, 'Nirchal');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'shop_store_email') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'shop_store_email', 'contact@nirchal.com', 'string', 'string', 'Store contact email', true, '');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'shop_currency') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'shop_currency', 'INR', 'string', 'string', 'Store currency', true, 'INR');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'shop_allow_guest_checkout') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'shop_allow_guest_checkout', 'true', 'boolean', 'boolean', 'Allow checkout without registration', false, 'true');
    END IF;
    
    -- Payment Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'payment_razorpay_enabled') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('payment', 'payment_razorpay_enabled', 'true', 'boolean', 'boolean', 'Enable Razorpay payments', false, 'false');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'payment_razorpay_key_id') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value, is_encrypted) 
        VALUES ('payment', 'payment_razorpay_key_id', '', 'string', 'string', 'Razorpay Key ID', false, '', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'payment_razorpay_key_secret') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value, is_encrypted) 
        VALUES ('payment', 'payment_razorpay_key_secret', '', 'string', 'string', 'Razorpay Key Secret', false, '', true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'payment_cod_enabled') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('payment', 'payment_cod_enabled', 'true', 'boolean', 'boolean', 'Enable Cash on Delivery', false, 'true');
    END IF;
    
    -- Billing Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'billing_tax_rate') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('billing', 'billing_tax_rate', '18', 'number', 'number', 'Default tax rate (%)', false, '18');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'billing_tax_enabled') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('billing', 'billing_tax_enabled', 'true', 'boolean', 'boolean', 'Enable tax calculations', false, 'true');
    END IF;
    
    -- SEO Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'seo_site_title') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('seo', 'seo_site_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'string', 'Default page title', true, '');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'seo_meta_description') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('seo', 'seo_meta_description', 'Discover premium Indian ethnic wear at Nirchal. Shop sarees, lehengas, and traditional clothing with authentic craftsmanship.', 'string', 'string', 'Default meta description', false, '');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'seo_meta_keywords') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('seo', 'seo_meta_keywords', 'indian ethnic wear, sarees, lehengas, traditional clothing, ethnic fashion', 'string', 'string', 'Default meta keywords', false, '');
    END IF;
END $$;

-- Step 6: Create compatible functions
CREATE OR REPLACE FUNCTION get_settings_by_category(category_name TEXT)
RETURNS TABLE (
    key TEXT,
    value TEXT,
    type TEXT,
    data_type TEXT,
    description TEXT,
    is_required BOOLEAN,
    default_value TEXT,
    is_encrypted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.key::TEXT,
        s.value::TEXT,
        COALESCE(s.type, s.data_type, 'string')::TEXT,
        COALESCE(s.data_type, s.type, 'string')::TEXT,
        s.description::TEXT,
        COALESCE(s.is_required, false),
        s.default_value::TEXT,
        COALESCE(s.is_encrypted, false)
    FROM settings s
    WHERE s.category = category_name
    ORDER BY s.key;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_setting_value(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
    setting_value TEXT;
BEGIN
    SELECT value INTO setting_value
    FROM settings 
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_setting_by_key(
    setting_key TEXT,
    setting_value TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE settings 
    SET 
        value = setting_value,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE key = setting_key;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_type ON settings(type);

-- Step 8: Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'settings' 
        AND rowsecurity = true
        AND schemaname = 'public'
    ) THEN
        ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'settings_categories' 
        AND rowsecurity = true
        AND schemaname = 'public'
    ) THEN
        ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 9: Create policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow read access to settings categories" ON settings_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

CREATE POLICY "Allow read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow read access to settings categories" ON settings_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 10: Grant permissions
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON settings_categories TO anon, authenticated;
GRANT UPDATE ON settings TO authenticated;

-- Step 11: Show results
SELECT 'Compatible migration completed successfully!' as status;
SELECT 'Categories created: ' || COUNT(*)::text as categories_count FROM settings_categories;
SELECT 'Settings created: ' || COUNT(*)::text as settings_count FROM settings;

-- Show sample of settings by category
SELECT 'Shop settings:' as info;
SELECT key, value FROM settings WHERE category = 'shop' LIMIT 3;

SELECT 'Payment settings:' as info;
SELECT key, value FROM settings WHERE category = 'payment' LIMIT 3;
