-- Fix the products table schema
-- First, let's check if we need to update the existing products table

-- If the products table exists with the wrong schema, we need to fix it
-- This script will handle the correction

-- Update products table to use category_id instead of category string
ALTER TABLE products 
DROP COLUMN IF EXISTS category;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id);

-- Update existing products to have proper category_id
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'sarees') WHERE name LIKE '%Saree%';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'lehengas') WHERE name LIKE '%Lehenga%';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'kurtis') WHERE name LIKE '%Kurti%';

-- Insert sample products with correct schema if they don't exist
INSERT INTO products (name, price, description, category_id, featured) 
SELECT 'Traditional Silk Saree', 5999.00, 'Handwoven silk saree with traditional design',
  (SELECT id FROM categories WHERE slug = 'sarees'), true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Traditional Silk Saree');

INSERT INTO products (name, price, description, category_id, featured) 
SELECT 'Designer Lehenga', 12999.00, 'Embroidered designer lehenga with contemporary patterns',
  (SELECT id FROM categories WHERE slug = 'lehengas'), true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Designer Lehenga');

INSERT INTO products (name, price, description, category_id, featured) 
SELECT 'Casual Cotton Kurti', 1499.00, 'Comfortable cotton kurti for daily wear',
  (SELECT id FROM categories WHERE slug = 'kurtis'), true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Casual Cotton Kurti');

INSERT INTO products (name, price, description, category_id, featured) 
SELECT 'Party Wear Lehenga', 3999.00, 'Elegant party wear lehenga with modern design',
  (SELECT id FROM categories WHERE slug = 'lehengas'), true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Party Wear Lehenga');