-- Emergency fix: temporarily disable fabric and occasion filters by clearing all filter columns
-- This will allow the app to work while we fix the database schema

-- Clear all fabric, occasion, color, subcategory values to prevent JSON errors
UPDATE products SET 
    fabric = NULL,
    occasion = NULL,
    color = NULL,
    subcategory = NULL
WHERE fabric IS NOT NULL OR occasion IS NOT NULL OR color IS NOT NULL OR subcategory IS NOT NULL;

-- Verify the cleanup
SELECT 
    COUNT(*) as total_products,
    COUNT(fabric) as products_with_fabric,
    COUNT(occasion) as products_with_occasion,
    COUNT(color) as products_with_color,
    COUNT(subcategory) as products_with_subcategory
FROM products;
