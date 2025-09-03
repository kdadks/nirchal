-- Add Razorpay payment gateway settings to the settings table
-- This migration adds all necessary Razorpay configuration settings

-- Insert Razorpay settings
INSERT INTO settings (category, key, value, data_type, description, is_encrypted, is_required) VALUES
  -- Production settings
  ('payment', 'razorpay_key_id', '', 'string', 'Razorpay Key ID for production environment', true, true),
  ('payment', 'razorpay_key_secret', '', 'string', 'Razorpay Key Secret for production environment', true, true),
  
  -- Test environment settings
  ('payment', 'razorpay_test_key_id', '', 'string', 'Razorpay Test Key ID for development/testing', true, false),
  ('payment', 'razorpay_test_key_secret', '', 'string', 'Razorpay Test Key Secret for development/testing', true, false),
  
  -- Environment and configuration
  ('payment', 'razorpay_environment', 'test', 'string', 'Razorpay environment mode (test/live)', false, true),
  ('payment', 'razorpay_enabled', 'false', 'boolean', 'Enable/disable Razorpay payment gateway', false, true),
  
  -- Webhook settings
  ('payment', 'razorpay_webhook_secret', '', 'string', 'Razorpay webhook secret for payment verification', true, false),
  ('payment', 'razorpay_webhook_url', '', 'string', 'Razorpay webhook endpoint URL', false, false),
  
  -- Company details for Razorpay checkout
  ('payment', 'razorpay_company_name', 'Nirchal', 'string', 'Company name displayed in Razorpay checkout', false, true),
  ('payment', 'razorpay_company_logo', '', 'string', 'Company logo URL for Razorpay checkout', false, false),
  ('payment', 'razorpay_theme_color', '#f59e0b', 'string', 'Theme color for Razorpay checkout (hex code)', false, false),
  
  -- Order settings
  ('payment', 'razorpay_currency', 'INR', 'string', 'Default currency for Razorpay transactions', false, true),
  ('payment', 'razorpay_auto_capture', 'true', 'boolean', 'Auto-capture payments (true) or manual capture (false)', false, true),
  
  -- Additional configuration
  ('payment', 'razorpay_description', 'Payment for Nirchal order', 'string', 'Default description for Razorpay payments', false, false),
  ('payment', 'razorpay_timeout', '900', 'number', 'Payment timeout in seconds (default: 15 minutes)', false, false)

ON CONFLICT (category, key) 
DO UPDATE SET 
  description = EXCLUDED.description,
  data_type = EXCLUDED.data_type,
  is_encrypted = EXCLUDED.is_encrypted,
  is_required = EXCLUDED.is_required,
  updated_at = CURRENT_TIMESTAMP;

-- Create index for faster payment settings lookup
CREATE INDEX IF NOT EXISTS idx_settings_payment_category 
ON settings(category) WHERE category = 'payment';

-- Add comment to table
COMMENT ON TABLE settings IS 'Application settings including payment gateway configurations like Razorpay';

-- Add comments to specific columns for Razorpay settings
DO $$
DECLARE
    setting_record RECORD;
BEGIN
    -- Add helpful comments for key Razorpay settings
    FOR setting_record IN 
        SELECT id, key FROM settings 
        WHERE category = 'payment' AND key LIKE 'razorpay_%'
    LOOP
        CASE setting_record.key
            WHEN 'razorpay_key_id' THEN
                UPDATE settings SET description = 'Razorpay Key ID (rzp_live_xxx for production, rzp_test_xxx for testing)' WHERE id = setting_record.id;
            WHEN 'razorpay_key_secret' THEN  
                UPDATE settings SET description = 'Razorpay Key Secret - Keep this secure and encrypted' WHERE id = setting_record.id;
            WHEN 'razorpay_environment' THEN
                UPDATE settings SET description = 'Environment: "test" for development, "live" for production' WHERE id = setting_record.id;
            WHEN 'razorpay_webhook_secret' THEN
                UPDATE settings SET description = 'Webhook secret for verifying Razorpay webhook calls' WHERE id = setting_record.id;
            ELSE
                -- Keep existing descriptions for other settings
        END CASE;
    END LOOP;
END $$;

-- Create a view for easy access to Razorpay settings
CREATE OR REPLACE VIEW razorpay_settings AS
SELECT 
    key,
    value,
    data_type,
    is_encrypted,
    description
FROM settings 
WHERE category = 'payment' 
  AND key LIKE 'razorpay_%'
  AND key NOT LIKE '%secret%' -- Exclude secret keys from view for security
ORDER BY key;

-- Grant appropriate permissions (adjust as needed for your setup)
-- GRANT SELECT ON razorpay_settings TO authenticated;
-- GRANT ALL ON settings TO service_role;

-- Validation function for Razorpay settings
CREATE OR REPLACE FUNCTION validate_razorpay_settings()
RETURNS TABLE(setting_key TEXT, is_valid BOOLEAN, validation_message TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.key::TEXT,
        CASE 
            WHEN s.key = 'razorpay_key_id' AND s.value ~ '^rzp_(live|test)_[A-Za-z0-9]+$' THEN TRUE
            WHEN s.key = 'razorpay_environment' AND s.value IN ('test', 'live') THEN TRUE
            WHEN s.key = 'razorpay_currency' AND s.value = 'INR' THEN TRUE
            WHEN s.key = 'razorpay_theme_color' AND s.value ~ '^#[0-9A-Fa-f]{6}$' THEN TRUE
            WHEN s.key = 'razorpay_enabled' AND s.value IN ('true', 'false') THEN TRUE
            WHEN s.key = 'razorpay_auto_capture' AND s.value IN ('true', 'false') THEN TRUE
            WHEN s.key LIKE '%secret%' AND LENGTH(s.value) > 10 THEN TRUE
            WHEN s.key = 'razorpay_timeout' AND s.value::INTEGER BETWEEN 60 AND 3600 THEN TRUE
            ELSE FALSE
        END as is_valid,
        CASE 
            WHEN s.key = 'razorpay_key_id' AND NOT (s.value ~ '^rzp_(live|test)_[A-Za-z0-9]+$') 
                THEN 'Key ID must start with rzp_live_ or rzp_test_ followed by alphanumeric characters'
            WHEN s.key = 'razorpay_environment' AND s.value NOT IN ('test', 'live') 
                THEN 'Environment must be either "test" or "live"'
            WHEN s.key = 'razorpay_currency' AND s.value != 'INR' 
                THEN 'Currency should be INR for Indian operations'
            WHEN s.key = 'razorpay_theme_color' AND NOT (s.value ~ '^#[0-9A-Fa-f]{6}$') 
                THEN 'Theme color must be a valid hex color code (e.g., #f59e0b)'
            WHEN s.key LIKE '%secret%' AND LENGTH(s.value) <= 10 
                THEN 'Secret keys must be longer than 10 characters'
            WHEN s.key = 'razorpay_timeout' AND NOT (s.value::INTEGER BETWEEN 60 AND 3600) 
                THEN 'Timeout must be between 60 and 3600 seconds'
            ELSE 'Valid'
        END::TEXT as validation_message
    FROM settings s
    WHERE s.category = 'payment' AND s.key LIKE 'razorpay_%';
END;
$$;

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'settings_updated_at_trigger'
    ) THEN
        CREATE TRIGGER settings_updated_at_trigger
            BEFORE UPDATE ON settings
            FOR EACH ROW
            EXECUTE FUNCTION update_settings_updated_at();
    END IF;
END $$;

-- Sample usage examples (commented out - uncomment to use)
/*
-- To get all Razorpay settings:
-- SELECT * FROM razorpay_settings;

-- To validate Razorpay settings:
-- SELECT * FROM validate_razorpay_settings();

-- To update a specific setting:
-- UPDATE settings 
-- SET value = 'rzp_test_your_key_here' 
-- WHERE category = 'payment' AND key = 'razorpay_test_key_id';

-- To check if Razorpay is enabled:
-- SELECT value::BOOLEAN as razorpay_enabled 
-- FROM settings 
-- WHERE category = 'payment' AND key = 'razorpay_enabled';
*/
