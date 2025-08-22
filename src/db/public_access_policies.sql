-- Enable public access to products and categories tables

-- Products table policies
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT TO PUBLIC USING (true);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Categories table policies  
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT TO PUBLIC USING (true);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Product images table policies (critical for image loading)
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT TO PUBLIC USING (true);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Inventory table policies (needed for stock status on product pages)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "inventory_public_read" ON inventory;
        CREATE POLICY "inventory_public_read" ON inventory FOR SELECT TO PUBLIC USING (true);
        ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Product variants table policies (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
        ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;
        CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT TO PUBLIC USING (true);
        ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Product reviews table policies (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        ALTER TABLE product_reviews DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_reviews_public_read" ON product_reviews;
        CREATE POLICY "product_reviews_public_read" ON product_reviews FOR SELECT TO PUBLIC USING (true);
        ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Grant permissions to anonymous and authenticated users
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON product_images TO anon, authenticated;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        GRANT SELECT ON inventory TO anon, authenticated;
    END IF;
END $$;

-- Grant permissions for variants and reviews if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
        GRANT SELECT ON product_variants TO anon, authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_reviews') THEN
        GRANT SELECT ON product_reviews TO anon, authenticated;
    END IF;
END $$;
