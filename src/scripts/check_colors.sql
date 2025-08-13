-- Check product_variants table structure and data
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

-- Check some sample data from product_variants
SELECT 
    pv.id,
    pv.product_id,
    p.name as product_name,
    pv.color,
    pv.size,
    pv.quantity,
    pv.price_adjustment
FROM product_variants pv
LEFT JOIN products p ON p.id = pv.product_id
ORDER BY pv.product_id
LIMIT 10;

-- Count how many variants have color data
SELECT 
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != '' THEN 1 END) as variants_with_color,
    COUNT(DISTINCT color) as unique_colors
FROM product_variants;

-- Show unique colors
SELECT DISTINCT color
FROM product_variants
WHERE color IS NOT NULL AND color != ''
ORDER BY color;
