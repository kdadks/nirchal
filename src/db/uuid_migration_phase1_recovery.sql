-- UUID Migration Recovery Script - Complete Phase 1
-- Only add missing pieces from the partial Phase 1 execution

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check and add missing UUID primary key columns to core tables
-- Add uuid_id to customer_addresses if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_addresses' AND column_name = 'uuid_id') THEN
            ALTER TABLE customer_addresses ADD COLUMN uuid_id UUID DEFAULT uuid_generate_v4();
            RAISE NOTICE 'Added uuid_id column to customer_addresses';
        END IF;
    END IF;
END $$;

-- Check and add missing uuid_parent_id column to categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'uuid_parent_id'
    ) THEN
        ALTER TABLE categories ADD COLUMN uuid_parent_id UUID;
        RAISE NOTICE 'Added uuid_parent_id column to categories';
    ELSE
        RAISE NOTICE 'uuid_parent_id column already exists in categories';
    END IF;
END $$;

-- Add UUID columns to dependent tables that reference core tables
-- For inventory table (if it exists and doesn't have UUID columns)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'uuid_product_id') THEN
            ALTER TABLE inventory ADD COLUMN uuid_product_id UUID;
            RAISE NOTICE 'Added uuid_product_id column to inventory';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'uuid_variant_id') THEN
            ALTER TABLE inventory ADD COLUMN uuid_variant_id UUID;
            RAISE NOTICE 'Added uuid_variant_id column to inventory';
        END IF;
    END IF;
END $$;

-- For product_reviews table (if it exists and doesn't have UUID columns)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_reviews' AND column_name = 'uuid_product_id') THEN
            ALTER TABLE product_reviews ADD COLUMN uuid_product_id UUID;
            RAISE NOTICE 'Added uuid_product_id column to product_reviews';
        END IF;
    END IF;
END $$;

-- For customer_addresses table (if it exists and doesn't have UUID columns)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_addresses' AND column_name = 'uuid_customer_id') THEN
            ALTER TABLE customer_addresses ADD COLUMN uuid_customer_id UUID;
            RAISE NOTICE 'Added uuid_customer_id column to customer_addresses';
        END IF;
    END IF;
END $$;

-- Populate any NULL UUID values (in case some weren't populated)
UPDATE categories SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE products SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE customers SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE orders SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE product_images SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE product_variants SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;
UPDATE customer_addresses SET uuid_id = uuid_generate_v4() WHERE uuid_id IS NULL;

-- Update foreign key references (safe to run multiple times)
UPDATE products 
SET uuid_category_id = categories.uuid_id 
FROM categories 
WHERE products.category_id = categories.id
AND products.uuid_category_id IS NULL;

UPDATE categories 
SET uuid_parent_id = parent_categories.uuid_id 
FROM categories AS parent_categories 
WHERE categories.parent_id = parent_categories.id
AND categories.uuid_parent_id IS NULL;

UPDATE product_images 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE product_images.product_id = products.id
AND product_images.uuid_product_id IS NULL;

UPDATE product_variants 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE product_variants.product_id = products.id
AND product_variants.uuid_product_id IS NULL;

UPDATE orders 
SET uuid_customer_id = customers.uuid_id 
FROM customers 
WHERE orders.customer_id = customers.id
AND orders.uuid_customer_id IS NULL;

-- Update dependent tables foreign key references
UPDATE inventory 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE inventory.product_id = products.id
AND inventory.uuid_product_id IS NULL;

UPDATE inventory 
SET uuid_variant_id = product_variants.uuid_id 
FROM product_variants 
WHERE inventory.variant_id = product_variants.id
AND inventory.uuid_variant_id IS NULL;

UPDATE product_reviews 
SET uuid_product_id = products.uuid_id 
FROM products 
WHERE product_reviews.product_id = products.id
AND product_reviews.uuid_product_id IS NULL;

UPDATE customer_addresses 
SET uuid_customer_id = customers.uuid_id 
FROM customers 
WHERE customer_addresses.customer_id = customers.id
AND customer_addresses.uuid_customer_id IS NULL;

-- Make UUID columns NOT NULL (safe to run multiple times)
DO $$
BEGIN
    -- Check if all uuid_id values are populated before setting NOT NULL
    IF (SELECT COUNT(*) FROM categories WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE categories ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
    
    IF (SELECT COUNT(*) FROM products WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE products ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
    
    IF (SELECT COUNT(*) FROM customers WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE customers ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
    
    IF (SELECT COUNT(*) FROM orders WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE orders ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
    
    IF (SELECT COUNT(*) FROM product_images WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE product_images ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
    
    IF (SELECT COUNT(*) FROM product_variants WHERE uuid_id IS NULL) = 0 THEN
        ALTER TABLE product_variants ALTER COLUMN uuid_id SET NOT NULL;
    END IF;
END $$;

-- Verification query
SELECT 
    'categories' as table_name,
    COUNT(*) as total_records,
    COUNT(uuid_id) as uuid_id_populated,
    COUNT(uuid_parent_id) as uuid_parent_id_populated
FROM categories
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as total_records,
    COUNT(uuid_id) as uuid_id_populated,
    COUNT(uuid_category_id) as uuid_category_id_populated
FROM products
UNION ALL
SELECT 
    'customers' as table_name,
    COUNT(*) as total_records,
    COUNT(uuid_id) as uuid_id_populated,
    0 as foreign_key_populated
FROM customers
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    COUNT(uuid_id) as uuid_id_populated,
    COUNT(uuid_customer_id) as uuid_customer_id_populated
FROM orders;

SELECT 'Phase 1 Recovery Complete!' as status;
