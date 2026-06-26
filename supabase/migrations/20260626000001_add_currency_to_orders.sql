-- Add currency field to orders table to track which currency the order was placed in
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR'));

-- Add index for querying by currency
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);

-- Comment for documentation
COMMENT ON COLUMN orders.currency IS 'Currency code (INR, USD, EUR) in which the order was placed';
