-- Insert sample products with fabric and occasion data for testing filters

-- First, let's make sure we have some basic categories
INSERT INTO categories (name, slug, description) VALUES 
('Sarees', 'sarees', 'Traditional Indian sarees'),
('Lehengas', 'lehengas', 'Designer lehengas'), 
('Kurtis', 'kurtis', 'Contemporary kurtis'),
('Salwar Suits', 'salwar-suits', 'Traditional salwar suits')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products with proper attributes
INSERT INTO products (
    name, slug, description, category_id, price, sale_price, 
    fabric, occasion, color, subcategory, is_active, is_featured
) VALUES 
(
    'Banarasi Silk Saree',
    'banarasi-silk-saree-red',
    'Handwoven Banarasi silk saree with traditional gold zari work',
    (SELECT id FROM categories WHERE slug = 'sarees'),
    8999.00, 6999.00,
    'Silk',
    '["wedding", "festival"]',
    'Red',
    'Traditional',
    true, true
),
(
    'Cotton Kurti Set',
    'cotton-kurti-blue',
    'Comfortable cotton kurti with palazzo pants',
    (SELECT id FROM categories WHERE slug = 'kurtis'),
    2499.00, 1999.00,
    'Cotton',
    '["casual", "formal"]',
    'Blue',
    'Casual',
    true, false
),
(
    'Georgette Lehenga',
    'georgette-lehenga-pink',
    'Designer georgette lehenga with heavy embroidery',
    (SELECT id FROM categories WHERE slug = 'lehengas'),
    15999.00, 12999.00,
    'Georgette',
    '["wedding", "party"]',
    'Pink',
    'Designer',
    true, true
),
(
    'Chiffon Saree',
    'chiffon-saree-green',
    'Light weight chiffon saree perfect for parties',
    (SELECT id FROM categories WHERE slug = 'sarees'),
    3999.00, 2999.00,
    'Chiffon',
    '["party", "casual"]',
    'Green',
    'Contemporary',
    true, false
),
(
    'Velvet Lehenga',
    'velvet-lehenga-maroon',
    'Luxurious velvet lehenga with mirror work',
    (SELECT id FROM categories WHERE slug = 'lehengas'),
    22999.00, 18999.00,
    'Velvet',
    '["wedding", "festival"]',
    'Maroon',
    'Bridal',
    true, true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    sale_price = EXCLUDED.sale_price,
    fabric = EXCLUDED.fabric,
    occasion = EXCLUDED.occasion,
    color = EXCLUDED.color,
    subcategory = EXCLUDED.subcategory,
    updated_at = CURRENT_TIMESTAMP;
