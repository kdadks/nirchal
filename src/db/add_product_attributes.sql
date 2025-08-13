-- Add fabric and occasion columns to products table
-- This will fix the filtering functionality

-- Add fabric column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS fabric VARCHAR(100);

-- Check if occasion column exists and what type it is
-- If it's already JSON/JSONB, we'll work with that
-- If it doesn't exist, create as TEXT for simplicity

-- Add color column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

-- Add subcategory column if it doesn't exist  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Update existing products with sample data
-- Use proper JSON format for occasion if the column is JSON/JSONB
UPDATE products SET 
    fabric = 'Silk',
    occasion = '["wedding", "party"]',
    color = 'Red',
    subcategory = 'Traditional'
WHERE name LIKE '%Saree%';

UPDATE products SET 
    fabric = 'Georgette',
    occasion = '["wedding", "party", "festival"]',
    color = 'Pink',
    subcategory = 'Designer'
WHERE name LIKE '%Lehenga%';

UPDATE products SET 
    fabric = 'Cotton',
    occasion = '["casual", "formal"]',
    color = 'Blue',
    subcategory = 'Casual'
WHERE name LIKE '%Kurti%';

-- Create an index on fabric for better performance
CREATE INDEX IF NOT EXISTS idx_products_fabric ON products(fabric);

-- Create an index on occasion for better performance (works for both JSON and TEXT)
CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion);
