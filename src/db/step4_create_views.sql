-- Step 4: Create views for dashboard
-- Execute this after Step 3

-- Drop existing views if they exist
DROP VIEW IF EXISTS recent_orders_view;
DROP VIEW IF EXISTS top_products_view;

-- Create recent orders view
CREATE VIEW recent_orders_view AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    c.first_name,
    c.last_name,
    c.email,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    CONCAT(UPPER(LEFT(c.first_name, 1)), UPPER(LEFT(c.last_name, 1))) as avatar_initials,
    CASE 
        WHEN o.created_at > NOW() - INTERVAL '5 minutes' THEN EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 || ' mins ago'
        WHEN o.created_at > NOW() - INTERVAL '1 hour' THEN EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 || ' mins ago'
        WHEN o.created_at > NOW() - INTERVAL '1 day' THEN EXTRACT(EPOCH FROM (NOW() - o.created_at))/3600 || ' hours ago'
        ELSE EXTRACT(EPOCH FROM (NOW() - o.created_at))/86400 || ' days ago'
    END as time_ago
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

-- Create top products view (simplified version since we don't have analytics data yet)
CREATE VIEW top_products_view AS
SELECT 
    p.id,
    p.name,
    COALESCE(COUNT(oi.product_id), 0) as total_sales,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    '+15%' as trend,
    pi.image_url
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
GROUP BY p.id, p.name, pi.image_url
HAVING COUNT(oi.product_id) > 0
ORDER BY total_sales DESC, total_revenue DESC
LIMIT 10;
