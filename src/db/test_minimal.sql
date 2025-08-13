-- Minimal test script to add just one product and see what columns work

-- First check what columns exist in products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check what columns exist in categories table  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Add categories first (if they don't exist)
INSERT INTO categories (name, slug, description) VALUES 
('Sarees', 'sarees', 'Traditional Indian sarees')
ON CONFLICT (slug) DO NOTHING;

-- Add just one test product with only the columns we know exist
INSERT INTO products (
    name, 
    slug, 
    description, 
    category_id, 
    price, 
    sale_price,
    is_active, 
    is_featured
) VALUES (
    'Test Silk Saree',
    'test-silk-saree',
    'A test saree for verifying database schema',
    (SELECT id FROM categories WHERE slug = 'sarees'),
    5999.00, 
    4999.00,
    true, 
    true
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    updated_at = CURRENT_TIMESTAMP;

-- Show what we inserted
SELECT id, name, slug, price, sale_price, category_id FROM products WHERE slug = 'test-silk-saree';
