-- Safe migration script that handles existing JSON occasion column
-- This script will work whether the occasion column exists or not, and handles both JSON and TEXT types

-- Step 1: Add missing columns (these are safe with IF NOT EXISTS)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS fabric VARCHAR(100);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Step 2: Handle occasion column - check if it exists first
DO $$
BEGIN
    -- Check if occasion column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'occasion'
    ) THEN
        -- Column doesn't exist, create it as TEXT for simplicity
        ALTER TABLE products ADD COLUMN occasion TEXT;
    END IF;
END $$;

-- Step 3: Update existing products with proper JSON format for occasion
-- This handles the case where occasion is already a JSON column

-- For Sarees
UPDATE products SET 
    fabric = COALESCE(fabric, 'Silk'),
    occasion = CASE 
        WHEN occasion IS NULL THEN '["wedding", "party"]'
        ELSE occasion 
    END,
    color = COALESCE(color, 'Red'),
    subcategory = COALESCE(subcategory, 'Traditional')
WHERE name LIKE '%Saree%' AND (fabric IS NULL OR occasion IS NULL OR color IS NULL OR subcategory IS NULL);

-- For Lehengas  
UPDATE products SET 
    fabric = COALESCE(fabric, 'Georgette'),
    occasion = CASE 
        WHEN occasion IS NULL THEN '["wedding", "party", "festival"]'
        ELSE occasion 
    END,
    color = COALESCE(color, 'Pink'),
    subcategory = COALESCE(subcategory, 'Designer')
WHERE name LIKE '%Lehenga%' AND (fabric IS NULL OR occasion IS NULL OR color IS NULL OR subcategory IS NULL);

-- For Kurtis
UPDATE products SET 
    fabric = COALESCE(fabric, 'Cotton'),
    occasion = CASE 
        WHEN occasion IS NULL THEN '["casual", "formal"]'
        ELSE occasion 
    END,
    color = COALESCE(color, 'Blue'),
    subcategory = COALESCE(subcategory, 'Casual')
WHERE name LIKE '%Kurti%' AND (fabric IS NULL OR occasion IS NULL OR color IS NULL OR subcategory IS NULL);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_fabric ON products(fabric);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);

-- For occasion, create index based on column type
DO $$
DECLARE
    col_type text;
BEGIN
    -- Get the data type of occasion column
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'occasion';
    
    -- Create appropriate index based on type
    IF col_type = 'json' OR col_type = 'jsonb' THEN
        -- Use GIN index for JSON types
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_occasion ON products USING GIN(occasion)';
    ELSE
        -- Use regular index for text types
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion)';
    END IF;
END $$;
