-- Simple script to add basic categories that are needed for product filtering

-- Insert basic categories that products reference
INSERT INTO categories (name, slug, description) VALUES 
('Sarees', 'sarees', 'Traditional Indian sarees in various styles and fabrics'),
('Lehengas', 'lehengas', 'Designer lehengas for special occasions'), 
('Kurtis', 'kurtis', 'Contemporary and traditional kurtis'),
('Salwar Suits', 'salwar-suits', 'Traditional salwar suits')
ON CONFLICT (slug) DO NOTHING;

-- Verify categories were created
SELECT id, name, slug, description FROM categories ORDER BY name;
