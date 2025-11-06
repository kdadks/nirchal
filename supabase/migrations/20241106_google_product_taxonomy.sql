-- Create Google Product Taxonomy table
CREATE TABLE IF NOT EXISTS google_product_categories (
    id INTEGER PRIMARY KEY,
    category_name TEXT NOT NULL,
    full_path TEXT NOT NULL,
    level INTEGER NOT NULL,
    parent_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on parent_id for faster hierarchical queries
CREATE INDEX IF NOT EXISTS idx_google_categories_parent ON google_product_categories(parent_id);

-- Create index on category_name for faster search
CREATE INDEX IF NOT EXISTS idx_google_categories_name ON google_product_categories(category_name);

-- Create full-text search index on full_path
CREATE INDEX IF NOT EXISTS idx_google_categories_fulltext ON google_product_categories USING gin(to_tsvector('english', full_path));

-- Add google_category_id to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS google_category_id INTEGER REFERENCES google_product_categories(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_google_category ON products(google_category_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_google_category_timestamp
    BEFORE UPDATE ON google_product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_google_category_updated_at();

-- Add comment to table
COMMENT ON TABLE google_product_categories IS 'Google Product Taxonomy for improved SEO and product categorization. Updated from Google Merchant Center taxonomy version 2021-09-21';
COMMENT ON COLUMN products.google_category_id IS 'Reference to Google Product Taxonomy category for SEO optimization';
