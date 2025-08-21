-- Query to find ALL foreign key dependencies on core tables
-- Run this in Supabase SQL Editor to see all dependent tables

SELECT 
    tc.table_name AS dependent_table,
    kcu.column_name AS dependent_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name IN ('categories', 'products', 'customers', 'orders', 'product_images', 'product_variants')
ORDER BY 
    ccu.table_name, tc.table_name;
