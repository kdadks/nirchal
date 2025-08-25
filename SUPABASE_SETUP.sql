-- Complete Database Setup for Nirchal E-commerce
-- Execute this script directly in Supabase SQL Editor

-- First, let's check if tables exist and drop them for a clean setup
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS settings_categories CASCADE;

-- 1. Create settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
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

-- 2. Create settings categories table
CREATE TABLE settings_categories (
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

-- 3. Insert settings categories
INSERT INTO settings_categories (name, label, description, icon, display_order) VALUES
('shop', 'Shop Settings', 'Basic store information and business settings', 'Store', 1),
('payment', 'Payment Gateway', 'Payment gateway configuration and settings', 'CreditCard', 2),
('email', 'Email Settings', 'Email configuration and SMTP settings', 'Mail', 3),
('billing', 'Billing', 'Tax and billing configuration', 'Receipt', 4),
('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 5);

-- 4. Insert all initial settings
INSERT INTO settings (category, key, value, data_type, description, is_required, default_value) VALUES

-- Shop Settings
('shop', 'store_name', 'Nirchal', 'string', 'Name of your store', true, 'Nirchal'),
('shop', 'store_email', 'contact@nirchal.com', 'string', 'Store contact email address', true, 'contact@nirchal.com'),
('shop', 'store_phone', '+91 98765 43210', 'string', 'Store contact phone number', true, ''),
('shop', 'store_address', 'Mumbai, Maharashtra, India', 'string', 'Store physical address', true, ''),
('shop', 'store_description', 'Premium Indian ethnic wear for the modern woman', 'string', 'Brief description of your store', false, ''),
('shop', 'currency', 'INR', 'string', 'Default currency for the store', true, 'INR'),
('shop', 'timezone', 'Asia/Kolkata', 'string', 'Store timezone', true, 'UTC'),
('shop', 'allow_guest_checkout', 'true', 'boolean', 'Allow customers to checkout without creating an account', false, 'true'),
('shop', 'auto_approve_reviews', 'false', 'boolean', 'Automatically approve customer reviews', false, 'false'),
('shop', 'low_stock_threshold', '10', 'number', 'Alert threshold for low stock items', false, '10'),
('shop', 'order_prefix', 'ORD', 'string', 'Prefix for order numbers', false, 'ORD'),
('shop', 'enable_inventory_tracking', 'true', 'boolean', 'Track product stock levels automatically', false, 'true'),

-- Social Media Settings
('shop', 'social_facebook_url', '', 'string', 'Facebook page URL', false, ''),
('shop', 'social_instagram_url', '', 'string', 'Instagram profile URL', false, ''),
('shop', 'social_twitter_url', '', 'string', 'Twitter profile URL', false, ''),
('shop', 'social_youtube_url', '', 'string', 'YouTube channel URL', false, ''),
('shop', 'social_linkedin_url', '', 'string', 'LinkedIn profile URL', false, ''),
('shop', 'social_pinterest_url', '', 'string', 'Pinterest profile URL', false, ''),
('shop', 'social_whatsapp_number', '', 'string', 'WhatsApp business number (with country code)', false, ''),
('shop', 'social_telegram_url', '', 'string', 'Telegram channel URL', false, ''),

-- Email Settings
('email', 'smtp_host', 'smtppro.zoho.in', 'string', 'SMTP server host', true, 'smtppro.zoho.in'),
('email', 'smtp_port', '465', 'number', 'SMTP server port', true, '465'),
('email', 'smtp_secure', 'true', 'boolean', 'Use SSL/TLS encryption', true, 'true'),
('email', 'smtp_user', '', 'string', 'SMTP username (email)', true, ''),
('email', 'smtp_password', '', 'string', 'SMTP password (encrypted)', true, ''),
('email', 'smtp_from', '', 'string', 'Default From email address', true, ''),
('email', 'smtp_reply_to', '', 'string', 'Default Reply-To email address', false, ''),
('email', 'imap_host', 'imappro.zoho.in', 'string', 'IMAP server host', false, 'imappro.zoho.in'),
('email', 'imap_port', '993', 'number', 'IMAP server port', false, '993'),
('email', 'imap_secure', 'true', 'boolean', 'Use SSL/TLS encryption for IMAP', false, 'true'),

-- Payment Gateway Settings
('payment', 'razorpay_enabled', 'true', 'boolean', 'Enable Razorpay payment gateway', false, 'false'),
('payment', 'razorpay_key_id', '', 'string', 'Razorpay Key ID for payments', false, ''),
('payment', 'razorpay_key_secret', '', 'string', 'Razorpay Key Secret (encrypted)', false, ''),
('payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payment gateway', false, 'false'),
('payment', 'stripe_publishable_key', '', 'string', 'Stripe Publishable Key', false, ''),
('payment', 'stripe_secret_key', '', 'string', 'Stripe Secret Key (encrypted)', false, ''),
('payment', 'paypal_enabled', 'false', 'boolean', 'Enable PayPal payment gateway', false, 'false'),
('payment', 'paypal_client_id', '', 'string', 'PayPal Client ID', false, ''),
('payment', 'paypal_client_secret', '', 'string', 'PayPal Client Secret (encrypted)', false, ''),
('payment', 'cod_enabled', 'true', 'boolean', 'Enable Cash on Delivery', false, 'false'),

-- Billing Settings
('billing', 'gst_number', '', 'string', 'GST registration number', false, ''),
('billing', 'pan_number', '', 'string', 'PAN card number', false, ''),
('billing', 'company_name', 'Nirchal Fashion Pvt Ltd', 'string', 'Registered company name', true, ''),
('billing', 'billing_address', 'Mumbai, Maharashtra, India', 'string', 'Company billing address', true, ''),
('billing', 'invoice_prefix', 'INV', 'string', 'Prefix for invoice numbers', false, 'INV'),
('billing', 'tax_rate', '18', 'number', 'Default tax rate percentage', false, '0'),
('billing', 'enable_gst', 'true', 'boolean', 'Apply GST to invoices and receipts', false, 'false'),

-- SEO Settings
('seo', 'site_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'Site title for search engines', true, 'My Store'),
('seo', 'meta_description', 'Discover exquisite Indian ethnic wear at Nirchal. Premium sarees, lehengas, and traditional outfits for the modern woman.', 'string', 'Meta description for search engines', false, ''),
('seo', 'meta_keywords', 'indian ethnic wear, sarees, lehengas, traditional clothing, ethnic fashion', 'string', 'Meta keywords for search engines', false, ''),
('seo', 'og_title', 'Nirchal - Premium Indian Ethnic Wear', 'string', 'Open Graph title for social media', false, ''),
('seo', 'og_description', 'Discover exquisite Indian ethnic wear at Nirchal', 'string', 'Open Graph description for social media', false, ''),
('seo', 'og_image', '', 'string', 'Open Graph image URL for social media', false, ''),
('seo', 'twitter_card', 'summary_large_image', 'string', 'Twitter card type', false, 'summary'),
('seo', 'canonical_url', 'https://nirchal.com', 'string', 'Canonical URL for SEO', false, ''),
('seo', 'robots_index', 'true', 'boolean', 'Allow search engine indexing', false, 'true'),
('seo', 'robots_follow', 'true', 'boolean', 'Allow search engines to follow links', false, 'true'),
('seo', 'enable_sitemap', 'true', 'boolean', 'Automatically generate XML sitemap', false, 'true'),
('seo', 'google_analytics_id', '', 'string', 'Google Analytics tracking ID', false, ''),
('seo', 'facebook_pixel_id', '', 'string', 'Facebook Pixel tracking ID', false, '');

-- 5. Enable Row Level Security (RLS) on tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for settings table
-- Allow all authenticated users to read all settings
CREATE POLICY "Allow read access to all settings" 
ON settings FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert settings
CREATE POLICY "Allow insert access to settings" 
ON settings FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update settings
CREATE POLICY "Allow update access to settings" 
ON settings FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to delete settings
CREATE POLICY "Allow delete access to settings" 
ON settings FOR DELETE 
TO authenticated 
USING (true);

-- 7. Create RLS policies for settings_categories table
-- Allow all authenticated users to read all settings categories
CREATE POLICY "Allow read access to all settings categories" 
ON settings_categories FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert settings categories
CREATE POLICY "Allow insert access to settings categories" 
ON settings_categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update settings categories
CREATE POLICY "Allow update access to settings categories" 
ON settings_categories FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to delete settings categories
CREATE POLICY "Allow delete access to settings categories" 
ON settings_categories FOR DELETE 
TO authenticated 
USING (true);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category_key ON settings(category, key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- 9. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers to automatically update the updated_at column
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_categories_updated_at 
    BEFORE UPDATE ON settings_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Verify the setup
SELECT 
  sc.name as category,
  sc.label as category_label,
  COUNT(s.id) as settings_count
FROM settings_categories sc
LEFT JOIN settings s ON sc.name = s.category
WHERE sc.is_active = true
GROUP BY sc.name, sc.label, sc.display_order
ORDER BY sc.display_order;
