-- Add has_return_request column to orders table
-- Migration: 20251026000003

-- Add column to track if order has a return request
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS has_return_request BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_has_return_request 
ON orders(has_return_request);

-- Update existing orders that have return requests
UPDATE orders o
SET has_return_request = TRUE
WHERE EXISTS (
  SELECT 1 FROM return_requests rr
  WHERE rr.order_id = o.id
);

-- Add comment
COMMENT ON COLUMN orders.has_return_request IS 'Indicates if this order has an associated return request';
