-- Check if any tables reference customer_addresses.id
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
    AND ccu.table_name = 'customer_addresses'
    AND ccu.column_name = 'id'
ORDER BY tc.table_name;
