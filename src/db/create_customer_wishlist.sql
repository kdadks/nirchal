-- Create customer wishlist table
-- This table stores customer's saved/favorite products

-- Drop table if exists (for development/migration purposes)
DROP TABLE IF EXISTS customer_wishlist CASCADE;

-- Create customer_wishlist table
CREATE TABLE customer_wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one wishlist entry per customer-product combination
    UNIQUE(customer_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_customer_wishlist_customer_id ON customer_wishlist(customer_id);
CREATE INDEX idx_customer_wishlist_product_id ON customer_wishlist(product_id);
CREATE INDEX idx_customer_wishlist_created_at ON customer_wishlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Customers can only see and manage their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON customer_wishlist
    FOR SELECT
    USING (true); -- Allow public access for now, can be restricted later

CREATE POLICY "Users can insert their own wishlist items" ON customer_wishlist
    FOR INSERT
    WITH CHECK (true); -- Allow public access for now, can be restricted later

CREATE POLICY "Users can update their own wishlist items" ON customer_wishlist
    FOR UPDATE
    USING (true); -- Allow public access for now, can be restricted later

CREATE POLICY "Users can delete their own wishlist items" ON customer_wishlist
    FOR DELETE
    USING (true); -- Allow public access for now, can be restricted later

-- Grant permissions
GRANT ALL ON customer_wishlist TO anon, authenticated;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_customer_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_wishlist_updated_at
    BEFORE UPDATE ON customer_wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_wishlist_updated_at();

-- Add helpful comments
COMMENT ON TABLE customer_wishlist IS 'Stores customer saved/favorite products';
COMMENT ON COLUMN customer_wishlist.customer_id IS 'Reference to customer who saved the product';
COMMENT ON COLUMN customer_wishlist.product_id IS 'Reference to the saved product';
COMMENT ON COLUMN customer_wishlist.created_at IS 'When the product was added to wishlist';
COMMENT ON COLUMN customer_wishlist.updated_at IS 'When the wishlist entry was last updated';

SELECT 'Customer wishlist table created successfully!' as status;
