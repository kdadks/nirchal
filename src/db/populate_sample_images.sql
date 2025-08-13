-- Sample data insertion for product images from Supabase storage
-- This script will reference actual images stored in the product-images bucket

-- First, let's see what products exist
SELECT p.id, p.name, COUNT(pi.id) as image_count 
FROM products p 
LEFT JOIN product_images pi ON p.id = pi.product_id 
GROUP BY p.id, p.name;

-- Insert sample image references for products that don't have any
-- These should reference actual files uploaded to your product-images storage bucket

INSERT INTO product_images (product_id, image_url, alt_text, is_primary)
SELECT p.id, 
       CASE 
         WHEN p.name ILIKE '%saree%' THEN 'saree-' || p.id || '.jpg'
         WHEN p.name ILIKE '%lehenga%' THEN 'lehenga-' || p.id || '.jpg'
         WHEN p.name ILIKE '%kurti%' THEN 'kurti-' || p.id || '.jpg'
         ELSE 'product-' || p.id || '.jpg'
       END,
       p.name,
       true
FROM products p
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_images WHERE product_id IS NOT NULL);

-- Also update the main image_url field in products table to reference storage
UPDATE products 
SET image_url = CASE 
  WHEN name ILIKE '%saree%' THEN 'saree-' || id || '.jpg'
  WHEN name ILIKE '%lehenga%' THEN 'lehenga-' || id || '.jpg'
  WHEN name ILIKE '%kurti%' THEN 'kurti-' || id || '.jpg'
  ELSE 'product-' || id || '.jpg'
END
WHERE image_url IS NULL OR image_url = '';

-- Verify the changes
SELECT p.id, p.name, p.image_url, COUNT(pi.id) as image_count 
FROM products p 
LEFT JOIN product_images pi ON p.id = pi.product_id 
GROUP BY p.id, p.name, p.image_url
ORDER BY p.id;
