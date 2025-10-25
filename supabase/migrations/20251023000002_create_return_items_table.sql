-- Create return_items table for tracking individual items in a return request
-- Migration: 20251023000002

CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES order_items(id) NOT NULL,
  
  -- Item Details (snapshot from order at time of return)
  product_id UUID REFERENCES products(id) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_variant_id UUID, -- Changed from variant_id to match order_items
  variant_size VARCHAR(100),
  variant_color VARCHAR(100),
  variant_material VARCHAR(100),
  product_sku VARCHAR(100), -- Changed from sku to match order_items
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0), -- Changed from unit_price
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  
  -- Inspection Results (Per Item)
  received_quantity INTEGER CHECK (received_quantity >= 0),
  condition_on_return VARCHAR(20) CHECK (condition_on_return IN (
    'excellent',
    'good',
    'fair',
    'poor',
    'damaged',
    'not_received'
  )),
  condition_notes TEXT,
  item_deduction_amount DECIMAL(10, 2) DEFAULT 0 CHECK (item_deduction_amount >= 0),
  item_deduction_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (item_deduction_percentage >= 0 AND item_deduction_percentage <= 100),
  item_deduction_reason TEXT,
  
  -- Restocking
  is_resaleable BOOLEAN DEFAULT FALSE,
  restocked BOOLEAN DEFAULT FALSE,
  restocked_date TIMESTAMP,
  restocked_quantity INTEGER CHECK (restocked_quantity >= 0),
  restocked_by UUID, -- References auth.users(id)
  
  -- Exchange Item (if return_type is 'return_exchange')
  exchange_product_id UUID REFERENCES products(id),
  exchange_variant_id UUID,
  exchange_product_name VARCHAR(255),
  exchange_variant_size VARCHAR(100),
  exchange_variant_color VARCHAR(100),
  exchange_variant_material VARCHAR(100),
  exchange_quantity INTEGER CHECK (exchange_quantity > 0),
  exchange_unit_price DECIMAL(10, 2) CHECK (exchange_unit_price >= 0),
  price_difference DECIMAL(10, 2), -- Can be positive (customer pays) or negative (refund)
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_received_quantity CHECK (received_quantity IS NULL OR received_quantity <= quantity),
  CONSTRAINT valid_restocked_quantity CHECK (restocked_quantity IS NULL OR restocked_quantity <= received_quantity)
);

-- Create indexes for better query performance
CREATE INDEX idx_return_items_return_request_id ON return_items(return_request_id);
CREATE INDEX idx_return_items_order_item_id ON return_items(order_item_id);
CREATE INDEX idx_return_items_product_id ON return_items(product_id);
CREATE INDEX idx_return_items_condition ON return_items(condition_on_return);
CREATE INDEX idx_return_items_restocked ON return_items(restocked) WHERE restocked = TRUE;

-- Add comments for documentation
COMMENT ON TABLE return_items IS 'Stores individual items within a return request with inspection and restocking details';
COMMENT ON COLUMN return_items.condition_on_return IS 'Quality condition of item upon inspection: excellent, good, fair, poor, damaged, not_received';
COMMENT ON COLUMN return_items.item_deduction_percentage IS 'Percentage deduction applied based on item condition (0-100)';
COMMENT ON COLUMN return_items.is_resaleable IS 'Whether item is in good enough condition to restock and resell';
COMMENT ON COLUMN return_items.price_difference IS 'For exchanges: positive if customer owes money, negative if customer gets refund';
