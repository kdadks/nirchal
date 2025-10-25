-- Add return and refund configuration settings
-- Migration: 20251023000005

-- Insert return/refund settings into settings table
INSERT INTO settings (category, key, value, data_type, description) VALUES
-- Return Policy Settings
('returns', 'return_enabled', 'true', 'string', 'Enable/disable return functionality globally'),
('returns', 'return_window_days', '7', 'string', 'Number of days after delivery for customers to request returns'),
('returns', 'exchange_enabled', 'true', 'string', 'Enable/disable exchange functionality'),

-- Eligibility Settings
('returns', 'min_order_amount', '0', 'string', 'Minimum order amount required for returns (0 = no minimum)'),
('returns', 'exclude_services', 'true', 'string', 'Exclude service items from returns (only products can be returned)'),
('returns', 'service_category_ids', '[]', 'string', 'JSON array of category IDs that represent services (not returnable)'),
('returns', 'service_category_slugs', '["services", "custom-stitching", "alterations", "customization"]', 'string', 'JSON array of category slugs that represent services'),
('returns', 'exclude_final_sale', 'true', 'string', 'Exclude final sale items from returns'),

-- Image/Video Requirements
('returns', 'require_images', 'true', 'string', 'Require customer to upload images for return request'),
('returns', 'min_images_required', '2', 'string', 'Minimum number of images required from customer'),
('returns', 'max_images_allowed', '5', 'string', 'Maximum number of images allowed per return request'),
('returns', 'allow_video', 'true', 'string', 'Allow video upload for return request'),
('returns', 'max_video_size_mb', '30', 'string', 'Maximum video file size in MB'),

-- Return Address Settings
('returns', 'return_address_line1', 'Nirchal Warehouse', 'string', 'Return shipping address line 1'),
('returns', 'return_address_line2', 'Building 5, Floor 2', 'string', 'Return shipping address line 2'),
('returns', 'return_address_city', 'Bangalore', 'string', 'Return shipping address city'),
('returns', 'return_address_state', 'Karnataka', 'string', 'Return shipping address state'),
('returns', 'return_address_postal_code', '560001', 'string', 'Return shipping address postal code'),
('returns', 'return_address_country', 'India', 'string', 'Return shipping address country'),
('returns', 'return_address_phone', '+91-9910489316', 'string', 'Return address contact phone number'),

-- Processing Settings
('returns', 'auto_approve_enabled', 'false', 'string', 'Auto-approve returns without manual review (not recommended)'),
('returns', 'auto_approve_max_amount', '2000', 'string', 'Auto-approve returns below this amount (if auto-approve enabled)'),
('returns', 'inspection_required_days', '3', 'string', 'Target days to complete inspection after receipt'),
('returns', 'refund_processing_days', '5', 'string', 'Expected days for refund after inspection approval'),

-- Deduction Settings
('returns', 'restocking_fee_enabled', 'false', 'string', 'Enable restocking fee on returns'),
('returns', 'restocking_fee_percentage', '0', 'string', 'Restocking fee percentage (if enabled)'),
('returns', 'quality_deduction_rates', '{"excellent": 0, "good": 5, "fair": 15, "poor": 30, "damaged": 50, "not_received": 100}', 'string', 'Deduction percentage by item condition'),

-- Return Reasons
('returns', 'return_reasons', '["defective", "wrong_item", "size_issue", "not_as_described", "quality_issue", "color_mismatch", "other"]', 'string', 'Available return reasons for customers to select'),

-- Email Notification Settings
('returns', 'notify_customer_on_approval', 'true', 'string', 'Send email when return is approved after inspection'),
('returns', 'notify_customer_on_receipt', 'true', 'string', 'Send email when return package is received at warehouse'),
('returns', 'notify_customer_on_inspection', 'true', 'string', 'Send email after inspection is completed'),
('returns', 'notify_customer_on_refund', 'true', 'string', 'Send email when refund is initiated and completed'),
('returns', 'notify_admin_new_return', 'true', 'string', 'Send email to admin when new return request is created'),
('returns', 'notify_admin_shipped', 'true', 'string', 'Send email to admin when customer ships return'),

-- Razorpay Settings
('returns', 'razorpay_refund_speed', 'normal', 'string', 'Default refund speed: normal (5-7 days, free) or optimum (instant, may have charges)'),
('returns', 'razorpay_auto_refund', 'true', 'string', 'Automatically process refund via Razorpay after approval'),

-- Inventory Settings
('returns', 'auto_restock_enabled', 'false', 'string', 'Automatically restock items marked as resaleable'),
('returns', 'restock_conditions', '["excellent", "good"]', 'string', 'Item conditions eligible for restocking')

ON CONFLICT (category, key) DO UPDATE
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Add comments
COMMENT ON TABLE settings IS 'Global application settings including return/refund configurations';
