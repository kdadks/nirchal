-- Update categories with image_url values that correspond to files in category-images bucket
-- Make sure these files actually exist in your Supabase storage bucket: category-images

UPDATE categories SET image_url = 'sarees.jpg' WHERE slug = 'sarees';
UPDATE categories SET image_url = 'lehengas.jpg' WHERE slug = 'lehengas';  
UPDATE categories SET image_url = 'suits.jpg' WHERE slug = 'suits';
UPDATE categories SET image_url = 'kurtis.jpg' WHERE slug = 'kurtis';
UPDATE categories SET image_url = 'gowns.jpg' WHERE slug = 'gowns';
UPDATE categories SET image_url = 'accessories.jpg' WHERE slug = 'accessories';

-- Alternative naming patterns if the above don't work:
-- UPDATE categories SET image_url = 'gown.jpg' WHERE slug = 'gowns';
-- UPDATE categories SET image_url = 'saree.jpg' WHERE slug = 'sarees';
-- UPDATE categories SET image_url = 'lehenga.jpg' WHERE slug = 'lehengas';
-- UPDATE categories SET image_url = 'suit.jpg' WHERE slug = 'suits';
-- UPDATE categories SET image_url = 'kurti.jpg' WHERE slug = 'kurtis';

-- Verify the updates
SELECT id, name, slug, image_url FROM categories ORDER BY name;
