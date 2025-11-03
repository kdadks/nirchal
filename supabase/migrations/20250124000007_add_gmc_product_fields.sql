-- Add Google Merchant Center fields to products table
-- GTIN (Global Trade Item Number): UPC, EAN, ISBN, etc.
-- MPN (Manufacturer Part Number): Product identifier from manufacturer

-- Add GTIN field
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50);

-- Add MPN field
ALTER TABLE products
ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);

-- Add gender field for apparel (required for GMC in major markets)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gender VARCHAR(20)
CHECK (gender IS NULL OR gender IN ('Female', 'Male', 'Unisex'));

-- Add age_group field for apparel (required for GMC in major markets)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS age_group VARCHAR(20)
CHECK (age_group IS NULL OR age_group IN ('Adult', 'Kids', 'Infant', 'Toddler', 'Newborn'));

-- Add google_product_category field
ALTER TABLE products
ADD COLUMN IF NOT EXISTS google_product_category VARCHAR(255);

-- Create index for GTIN lookups
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;

-- Create index for MPN lookups
CREATE INDEX IF NOT EXISTS idx_products_mpn ON products(mpn) WHERE mpn IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.gtin IS 'Global Trade Item Number (UPC, EAN, JAN, ISBN) - strongly recommended by Google Merchant Center';
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number - recommended product identifier for GMC';
COMMENT ON COLUMN products.gender IS 'Gender for apparel - required by GMC for major markets (Female, Male, Unisex)';
COMMENT ON COLUMN products.age_group IS 'Age group for apparel - required by GMC for major markets (Adult, Kids, Infant, etc.)';
COMMENT ON COLUMN products.google_product_category IS 'Google Product Category taxonomy value';
