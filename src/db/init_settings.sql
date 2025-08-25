-- Execute the settings schema
\i 'settings_schema.sql';

-- Insert initial settings categories
INSERT INTO settings_categories (name, label, description, icon, display_order) VALUES
('shop', 'Shop Settings', 'Basic store information and business settings', 'Store', 1),
('payment', 'Payment Gateway', 'Payment gateway configuration and settings', 'CreditCard', 2),
('billing', 'Billing', 'Tax and billing configuration', 'Receipt', 3),
('seo', 'SEO Settings', 'Search engine optimization settings', 'Search', 4)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- Insert initial shop settings
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
('seo', 'facebook_pixel_id', '', 'string', 'Facebook Pixel tracking ID', false, '')
ON CONFLICT (category, key) DO UPDATE SET
  value = CASE 
    WHEN settings.value = settings.default_value OR settings.value = '' THEN EXCLUDED.value
    ELSE settings.value
  END,
  description = EXCLUDED.description,
  is_required = EXCLUDED.is_required,
  default_value = EXCLUDED.default_value;

-- Verify the setup
SELECT 
  sc.name as category,
  sc.label as category_label,
  COUNT(s.id) as settings_count
FROM settings_categories sc
LEFT JOIN settings s ON sc.name = s.category
WHERE sc.is_active = true
GROUP BY sc.name, sc.label, sc.display_order
ORDER BY sc.display_order;
