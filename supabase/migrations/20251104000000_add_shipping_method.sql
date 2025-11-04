-- Add shipping method fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20) DEFAULT 'standard' CHECK (shipping_method IN ('standard', 'express')),
ADD COLUMN IF NOT EXISTS express_delivery_fee DECIMAL(10, 2) DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON orders(shipping_method);

-- Comment for documentation
COMMENT ON COLUMN orders.shipping_method IS 'Shipping method: standard (free, 3-7 days) or express (₹250, 1-3 days)';
COMMENT ON COLUMN orders.express_delivery_fee IS 'Express delivery fee charged (₹250 for express, ₹0 for standard)';
