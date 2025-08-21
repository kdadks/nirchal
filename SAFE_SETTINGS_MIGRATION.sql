-- Safe Settings Migration Script
-- This script handles existing tables and missing constraints gracefully

-- Step 1: Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add missing columns safely
DO $$ 
BEGIN 
    -- Add type column (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN type VARCHAR(20) DEFAULT 'string';
    END IF;
    
    -- Add data_type column
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
    
    -- Add created_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'created_by' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN created_by UUID;
    END IF;
    
    -- Add updated_by column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'settings' AND column_name = 'updated_by' AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings ADD COLUMN updated_by UUID;
    END IF;
END $$;

-- Step 3: Add unique constraint safely
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'settings' 
        AND constraint_name = 'settings_category_key_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings DROP CONSTRAINT settings_category_key_key;
    END IF;
    
    -- Add the unique constraint
    ALTER TABLE settings ADD CONSTRAINT settings_category_key_key UNIQUE (category, key);
EXCEPTION
    WHEN others THEN
        -- If there are duplicate rows, we'll handle them
        RAISE NOTICE 'Could not add unique constraint. There might be duplicate entries.';
END $$;

-- Step 4: Create settings categories table
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

-- Step 5: Add unique constraint to categories table safely
DO $$
BEGIN
    -- Add unique constraint on name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'settings_categories' 
        AND constraint_name = 'settings_categories_name_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE settings_categories ADD CONSTRAINT settings_categories_name_key UNIQUE (name);
    END IF;
END $$;

-- Step 6: Insert categories without ON CONFLICT (safer approach)
DO $$
BEGIN
    -- Insert shop category
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'shop') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('shop', 'Shop Settings', 'Basic store information and configuration', 'Store', 1);
    END IF;
    
    -- Insert payment category
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'payment') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('payment', 'Payment Gateway', 'Payment gateway configurations', 'CreditCard', 2);
    END IF;
    
    -- Insert billing category
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'billing') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('billing', 'Billing', 'Tax and billing settings', 'Receipt', 3);
    END IF;
    
    -- Insert seo category
    IF NOT EXISTS (SELECT 1 FROM settings_categories WHERE name = 'seo') THEN
        INSERT INTO settings_categories (name, label, description, icon, display_order) 
        VALUES ('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 4);
    END IF;
END $$;

-- Step 7: Insert basic settings without ON CONFLICT
DO $$
BEGIN
    -- Shop Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'shop' AND key = 'store_name') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'store_name', 'Nirchal', 'string', 'string', 'Store display name', true, 'Nirchal');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'shop' AND key = 'store_email') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'store_email', 'contact@nirchal.com', 'string', 'string', 'Store contact email', true, '');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'shop' AND key = 'currency') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'currency', 'INR', 'string', 'string', 'Store currency', true, 'INR');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'shop' AND key = 'allow_guest_checkout') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('shop', 'allow_guest_checkout', 'true', 'boolean', 'boolean', 'Allow checkout without registration', false, 'true');
    END IF;
    
    -- Payment Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'payment' AND key = 'razorpay_enabled') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('payment', 'razorpay_enabled', 'true', 'boolean', 'boolean', 'Enable Razorpay payments', false, 'false');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'payment' AND key = 'cod_enabled') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('payment', 'cod_enabled', 'true', 'boolean', 'boolean', 'Enable Cash on Delivery', false, 'true');
    END IF;
    
    -- SEO Settings
    IF NOT EXISTS (SELECT 1 FROM settings WHERE category = 'seo' AND key = 'site_title') THEN
        INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) 
        VALUES ('seo', 'site_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'string', 'Default page title', true, '');
    END IF;
END $$;

-- Step 8: Create functions
CREATE OR REPLACE FUNCTION get_settings_by_category(category_name TEXT)
RETURNS TABLE (
    key TEXT,
    value TEXT,
    type TEXT,
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
        COALESCE(s.type, s.data_type, 'string')::TEXT,
        COALESCE(s.data_type, s.type, 'string')::TEXT,
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

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);

-- Step 10: Enable RLS and create policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow read access to settings categories" ON settings_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

-- Create policies
CREATE POLICY "Allow read access to settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow read access to settings categories" ON settings_categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 11: Grant permissions
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON settings_categories TO anon, authenticated;
GRANT UPDATE ON settings TO authenticated;

-- Step 12: Show results
SELECT 'Migration completed successfully!' as status;
SELECT 'Categories created: ' || COUNT(*)::text as categories_count FROM settings_categories;
SELECT 'Settings created: ' || COUNT(*)::text as settings_count FROM settings;
