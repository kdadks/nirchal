-- Update featured sections display order and max_products
-- Priority: 1. New Arrivals, 2. Trending Now, 3. Featured Products
-- Show 5 products per section in one line

UPDATE featured_sections 
SET 
  display_order = 0,
  max_products = 5
WHERE slug = 'new-arrivals';

UPDATE featured_sections 
SET 
  display_order = 1,
  max_products = 5
WHERE slug = 'trending-now';

UPDATE featured_sections 
SET 
  display_order = 2,
  max_products = 5
WHERE slug = 'featured-products';
