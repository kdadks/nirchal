-- UUID Migration Script - Phase 1: Core Tables
-- Execute this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Add UUID columns to core tables
ALTER TABLE categories ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE products ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE customers ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE orders ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();

-- Step 2: Populate UUID values for existing records
UPDATE categories SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE products SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE customers SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE orders SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;

-- Step 3: Add UUID columns to dependent tables
ALTER TABLE products ADD COLUMN uuid_category_id UUID;
ALTER TABLE categories ADD COLUMN uuid_parent_id UUID;
ALTER TABLE product_images ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE product_images ADD COLUMN uuid_product_id UUID;
ALTER TABLE product_variants ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE product_variants ADD COLUMN uuid_product_id UUID;
ALTER TABLE orders ADD COLUMN uuid_customer_id UUID;

-- Step 4: Update foreign key references
UPDATE products 
SET uuid_category_id = categories.uuid_id 
FROM categories 
WHERE products.category_id = categories.id;

UPDATE categories 
SET uuid_parent_id = parent_categories.uuid_id 
FROM categories AS parent_categories 
WHERE categories.parent_id = parent_categories.id;

UPDATE product_images 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE product_images.product_id = products.id;

UPDATE product_variants 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE product_variants.product_id = products.id;

UPDATE orders 
SET uuid_customer_id = customers.uuid_id 
FROM customers 
WHERE orders.customer_id = customers.id;

-- Step 5: Make UUID columns NOT NULL
ALTER TABLE categories ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN uuid_category_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN uuid_customer_id SET NOT NULL;
ALTER TABLE product_images ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE product_images ALTER COLUMN uuid_product_id SET NOT NULL;
ALTER TABLE product_variants ALTER COLUMN uuid_id SET NOT NULL;
ALTER TABLE product_variants ALTER COLUMN uuid_product_id SET NOT NULL;

-- Verify the migration worked
SELECT 'categories' as table_name, count(*) as records, 
       count(uuid_id) as uuid_count 
FROM categories
UNION ALL
SELECT 'products', count(*), count(uuid_id) FROM products
UNION ALL
SELECT 'customers', count(*), count(uuid_id) FROM customers
UNION ALL
SELECT 'orders', count(*), count(uuid_id) FROM orders;
