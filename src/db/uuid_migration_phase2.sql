-- UUID Migration Script - Phase 2: Switch Primary Keys
-- Execute this AFTER Phase 1 is complete and verified

-- Step 1: Drop ALL foreign key constraints (including from dependent tables)
-- Core table foreign keys
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
-- Drop self-referencing constraint on categories
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;

-- Drop foreign keys from dependent tables (mentioned in error)
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_id_fkey;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_variant_id_fkey;
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS product_reviews_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_variant_id_fkey;
ALTER TABLE product_analytics DROP CONSTRAINT IF EXISTS product_analytics_product_id_fkey;
ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS order_status_history_order_id_fkey;
-- Drop customer_addresses foreign key
ALTER TABLE customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_customer_id_fkey;

-- Step 2: Drop database views and policies that depend on ID columns
-- Drop views that reference the ID columns
DROP VIEW IF EXISTS top_products_view CASCADE;
DROP VIEW IF EXISTS recent_orders_view CASCADE;
DROP VIEW IF EXISTS category_products_view CASCADE;
DROP VIEW IF EXISTS product_analytics_view CASCADE;

-- Drop RLS policies that reference ID columns
DROP POLICY IF EXISTS "Public read images of active products" ON product_images;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read variants" ON product_variants;

-- Step 3: Drop old primary key constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_pkey;

-- Step 4: Drop old integer ID columns
ALTER TABLE categories DROP COLUMN id;
ALTER TABLE categories DROP COLUMN parent_id;
ALTER TABLE products DROP COLUMN id;
ALTER TABLE products DROP COLUMN category_id;
ALTER TABLE customers DROP COLUMN id;
ALTER TABLE orders DROP COLUMN id;
ALTER TABLE orders DROP COLUMN customer_id;
ALTER TABLE product_images DROP COLUMN id;
ALTER TABLE product_images DROP COLUMN product_id;
ALTER TABLE product_variants DROP COLUMN id;
ALTER TABLE product_variants DROP COLUMN product_id;

-- Step 5: Rename UUID columns to id
ALTER TABLE categories RENAME COLUMN uuid_id TO id;
ALTER TABLE categories RENAME COLUMN uuid_parent_id TO parent_id;
ALTER TABLE products RENAME COLUMN uuid_id TO id;
ALTER TABLE products RENAME COLUMN uuid_category_id TO category_id;
ALTER TABLE customers RENAME COLUMN uuid_id TO id;
ALTER TABLE orders RENAME COLUMN uuid_id TO id;
ALTER TABLE orders RENAME COLUMN uuid_customer_id TO customer_id;
ALTER TABLE product_images RENAME COLUMN uuid_id TO id;
ALTER TABLE product_images RENAME COLUMN uuid_product_id TO product_id;
ALTER TABLE product_variants RENAME COLUMN uuid_id TO id;
ALTER TABLE product_variants RENAME COLUMN uuid_product_id TO product_id;

-- Step 6: Set new primary keys
ALTER TABLE categories ADD PRIMARY KEY (id);
ALTER TABLE products ADD PRIMARY KEY (id);
ALTER TABLE customers ADD PRIMARY KEY (id);
ALTER TABLE orders ADD PRIMARY KEY (id);
ALTER TABLE product_images ADD PRIMARY KEY (id);
ALTER TABLE product_variants ADD PRIMARY KEY (id);

-- Step 7: Recreate foreign key constraints
ALTER TABLE products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Recreate self-referencing constraint for categories (if parent_id column exists)
ALTER TABLE categories 
ADD CONSTRAINT categories_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Step 8: Handle dependent tables
-- For tables with data (inventory, product_reviews) - update their foreign key columns
DO $$
BEGIN
    -- Update inventory table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'product_id') THEN
            ALTER TABLE inventory DROP COLUMN product_id;
            ALTER TABLE inventory RENAME COLUMN uuid_product_id TO product_id;
            RAISE NOTICE 'Updated inventory table product_id foreign key to UUID';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'variant_id') THEN
            ALTER TABLE inventory DROP COLUMN variant_id;
            ALTER TABLE inventory RENAME COLUMN uuid_variant_id TO variant_id;
            RAISE NOTICE 'Updated inventory table variant_id foreign key to UUID';
        END IF;
    END IF;
    
    -- Update product_reviews table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_reviews' AND column_name = 'product_id') THEN
            ALTER TABLE product_reviews DROP COLUMN product_id;
            ALTER TABLE product_reviews RENAME COLUMN uuid_product_id TO product_id;
            RAISE NOTICE 'Updated product_reviews table foreign key to UUID';
        END IF;
    END IF;
    
    -- Update customer_addresses table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_addresses' AND column_name = 'customer_id') THEN
            ALTER TABLE customer_addresses DROP COLUMN customer_id;
            ALTER TABLE customer_addresses RENAME COLUMN uuid_customer_id TO customer_id;
            RAISE NOTICE 'Updated customer_addresses table foreign key to UUID';
        END IF;
    END IF;
END $$;

-- Recreate empty tables with UUID foreign keys
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    variant_size VARCHAR(50),
    variant_color VARCHAR(50),
    variant_material VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS order_status_history;
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    notify_customer BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate product_analytics with UUID foreign keys but keep INTEGER primary key
DROP TABLE IF EXISTS product_analytics;
CREATE TABLE product_analytics (
    id SERIAL PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10,2) DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    last_sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Recreate foreign key constraints for dependent tables
DO $$
BEGIN
    -- Recreate inventory foreign keys if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        ALTER TABLE inventory 
        ADD CONSTRAINT inventory_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
        
        ALTER TABLE inventory 
        ADD CONSTRAINT inventory_variant_id_fkey 
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Recreated inventory foreign key constraints';
    END IF;
    
    -- Recreate product_reviews foreign key if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        ALTER TABLE product_reviews 
        ADD CONSTRAINT product_reviews_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
        RAISE NOTICE 'Recreated product_reviews foreign key constraint';
    END IF;
    
    -- Recreate customer_addresses foreign key if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_addresses') THEN
        ALTER TABLE customer_addresses 
        ADD CONSTRAINT customer_addresses_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        RAISE NOTICE 'Recreated customer_addresses foreign key constraint';
    END IF;
END $$;

-- Verification query
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products', 'customers', 'orders', 'product_images', 'product_variants')
  AND column_name = 'id'
ORDER BY table_name;

-- Step 10: Recreate RLS policies with UUID references
-- Recreate public read policies
CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read variants" ON product_variants
    FOR SELECT USING (true);

CREATE POLICY "Public read images of active products" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.is_active = true
        )
    );

-- Step 11: Recreate database views with UUID references
-- Note: Views will be recreated in Phase 3 of the migration
