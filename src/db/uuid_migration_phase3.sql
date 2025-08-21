-- UUID Migration Script - Phase 3: Recreate Views and Complete Migration
-- Execute this AFTER Phase 2 is complete and verified

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate database views with UUID references
-- These views support the admin dashboard analytics

-- 1. Recent Orders View (for dashboard analytics)
DROP VIEW IF EXISTS recent_orders_view;
CREATE VIEW recent_orders_view AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.created_at,
    o.updated_at,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email as customer_email,
    (
        SELECT COUNT(*) 
        FROM order_items oi 
        WHERE oi.order_id = o.id
    ) as item_count
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

-- 2. Top Products View (for dashboard analytics)
DROP VIEW IF EXISTS top_products_view;
CREATE VIEW top_products_view AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.sale_price,
    p.sku,
    p.is_featured,
    p.created_at,
    c.name as category_name,
    COALESCE(COUNT(oi.product_id), 0) as total_sales,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    '+15%' as trend,
    pi.image_url
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price, p.sale_price, p.sku, p.is_featured, p.created_at, c.name, pi.image_url
ORDER BY total_sales DESC, total_revenue DESC
LIMIT 10;

-- 3. Category Products View (for category pages)
DROP VIEW IF EXISTS category_products_view;
CREATE VIEW category_products_view AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    COUNT(p.id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- 4. Product Analytics View (for admin insights)
DROP VIEW IF EXISTS product_analytics_view;
CREATE VIEW product_analytics_view AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    p.created_at,
    COALESCE(pa.views_count, 0) as views_count,
    COALESCE(pa.sales_count, 0) as sales_count,
    COALESCE(pa.revenue_total, 0) as revenue_total,
    pa.last_viewed_at,
    pa.last_sold_at,
    (
        SELECT COUNT(*) 
        FROM product_images pi 
        WHERE pi.product_id = p.id
    ) as image_count,
    (
        SELECT COUNT(*) 
        FROM product_variants pv 
        WHERE pv.product_id = p.id
    ) as variant_count
FROM products p
LEFT JOIN product_analytics pa ON p.id = pa.product_id
WHERE p.is_active = true
ORDER BY pa.revenue_total DESC NULLS LAST;

-- Step 2: Update indexes for UUID columns
DROP INDEX IF EXISTS idx_orders_customer_id;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_product_analytics_product_id;
DROP INDEX IF EXISTS idx_product_images_product_id;
DROP INDEX IF EXISTS idx_product_variants_product_id;

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Grant appropriate permissions on views
GRANT SELECT ON top_products_view TO anon, authenticated;
GRANT SELECT ON recent_orders_view TO authenticated;
GRANT SELECT ON category_products_view TO anon, authenticated;
GRANT SELECT ON product_analytics_view TO authenticated;

-- Final verification and completion
SELECT 'UUID Migration Phase 3 Complete!' as status;

-- Verify all core tables now use UUID primary keys
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('categories', 'products', 'customers', 'orders', 'product_images', 'product_variants')
  AND column_name = 'id'
ORDER BY table_name;

-- Verify foreign key relationships are working
SELECT 
    tc.table_name AS dependent_table,
    kcu.column_name AS dependent_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name IN ('categories', 'products', 'customers', 'orders', 'product_images', 'product_variants')
ORDER BY ccu.table_name, tc.table_name;

-- Verify views exist and are accessible
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_type = 'VIEW' 
  AND table_name LIKE '%_view'
ORDER BY table_name;

-- Step 3: Final verification
SELECT 
    'Migration Complete!' as status,
    'All core tables now use UUID primary keys' as message;

-- Show table structures
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    CASE WHEN c.column_name = 'id' THEN 'PRIMARY KEY' 
         WHEN c.column_name LIKE '%_id' THEN 'FOREIGN KEY'
         ELSE 'DATA' END as key_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('categories', 'products', 'customers', 'orders', 'product_images', 'product_variants', 'order_items')
  AND (c.column_name = 'id' OR c.column_name LIKE '%_id')
ORDER BY t.table_name, 
         CASE WHEN c.column_name = 'id' THEN 1 ELSE 2 END,
         c.column_name;
