-- Google Product Taxonomy Data - Sample/Test Data
-- Full data will be loaded via API or import script
-- This is a starter set with common categories

BEGIN;

-- Insert top-level categories
INSERT INTO google_product_categories (id, category_name, full_path, level, parent_id) VALUES
  (1, 'Animals & Pet Supplies', 'Animals & Pet Supplies', 1, NULL),
  (166, 'Apparel & Accessories', 'Apparel & Accessories', 1, NULL),
  (8, 'Arts & Entertainment', 'Arts & Entertainment', 1, NULL),
  (536, 'Baby & Toddler', 'Baby & Toddler', 1, NULL),
  (111, 'Business & Industrial', 'Business & Industrial', 1, NULL),
  (141, 'Cameras & Optics', 'Cameras & Optics', 1, NULL),
  (222, 'Electronics', 'Electronics', 1, NULL),
  (412, 'Food, Beverages & Tobacco', 'Food, Beverages & Tobacco', 1, NULL),
  (469, 'Health & Beauty', 'Health & Beauty', 1, NULL),
  (436, 'Furniture', 'Furniture', 1, NULL),
  (632, 'Hardware', 'Hardware', 1, NULL),
  (574, 'Home & Garden', 'Home & Garden', 1, NULL),
  (5181, 'Luggage & Bags', 'Luggage & Bags', 1, NULL),
  (783, 'Media', 'Media', 1, NULL),
  (922, 'Office Supplies', 'Office Supplies', 1, NULL),
  (5605, 'Religious & Ceremonial', 'Religious & Ceremonial', 1, NULL),
  (2092, 'Software', 'Software', 1, NULL),
  (988, 'Sporting Goods', 'Sporting Goods', 1, NULL),
  (1239, 'Toys & Games', 'Toys & Games', 1, NULL),
  (888, 'Vehicles & Parts', 'Vehicles & Parts', 1, NULL)
ON CONFLICT (id) DO UPDATE SET 
  category_name = EXCLUDED.category_name,
  full_path = EXCLUDED.full_path,
  level = EXCLUDED.level,
  parent_id = EXCLUDED.parent_id,
  updated_at = CURRENT_TIMESTAMP;

-- Insert some popular second-level categories for common product types
INSERT INTO google_product_categories (id, category_name, full_path, level, parent_id) VALUES
  -- Apparel & Accessories
  (1604, 'Clothing', 'Apparel & Accessories > Clothing', 2, 166),
  (188, 'Jewelry', 'Apparel & Accessories > Jewelry', 2, 166),
  (187, 'Shoes', 'Apparel & Accessories > Shoes', 2, 166),
  
  -- Electronics
  (223, 'Audio', 'Electronics > Audio', 2, 222),
  (278, 'Computers', 'Electronics > Computers', 2, 222),
  (2082, 'Electronics Accessories', 'Electronics > Electronics Accessories', 2, 222),
  
  -- Home & Garden
  (574, 'Bathroom Accessories', 'Home & Garden > Bathroom Accessories', 2, 574),
  (638, 'Kitchen & Dining', 'Home & Garden > Kitchen & Dining', 2, 574),
  (696, 'Decor', 'Home & Garden > Decor', 2, 574),
  (436, 'Furniture', 'Home & Garden > Furniture', 2, 574),
  
  -- Health & Beauty
  (491, 'Health Care', 'Health & Beauty > Health Care', 2, 469),
  (2915, 'Personal Care', 'Health & Beauty > Personal Care', 2, 469),
  
  -- Sporting Goods
  (499713, 'Athletics', 'Sporting Goods > Athletics', 2, 988),
  (990, 'Exercise & Fitness', 'Sporting Goods > Exercise & Fitness', 2, 988),
  (499696, 'Outdoor Recreation', 'Sporting Goods > Outdoor Recreation', 2, 988)
ON CONFLICT (id) DO UPDATE SET 
  category_name = EXCLUDED.category_name,
  full_path = EXCLUDED.full_path,
  level = EXCLUDED.level,
  parent_id = EXCLUDED.parent_id,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- Note: To load the complete Google Product Taxonomy (5000+ categories),
-- use the parse-google-taxonomy.ts script or load from the provided data file.
