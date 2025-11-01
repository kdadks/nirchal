-- CHECK CUSTOMERS TABLE RLS POLICIES IN DETAIL
-- Run this in Supabase SQL Editor to see the exact policies

SELECT 
    p.polname as policy_name,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END as command_type,
    CASE 
        WHEN p.polroles::text = '{0}' THEN 'public'
        WHEN p.polroles::text LIKE '%authenticated%' OR array_position(p.polroles, 'authenticated'::regrole) IS NOT NULL THEN 'authenticated'
        WHEN p.polroles::text LIKE '%service_role%' OR array_position(p.polroles, 'service_role'::regrole) IS NOT NULL THEN 'service_role'
        WHEN p.polroles::text LIKE '%anon%' OR array_position(p.polroles, 'anon'::regrole) IS NOT NULL THEN 'anon'
        ELSE 'other: ' || p.polroles::text
    END as applies_to_role,
    pg_get_expr(p.polqual, p.polrelid) as using_expression,
    pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname = 'customers'
ORDER BY 
    CASE p.polcmd
        WHEN '*' THEN 1
        WHEN 'r' THEN 2
        WHEN 'a' THEN 3
        WHEN 'w' THEN 4
        WHEN 'd' THEN 5
    END,
    p.polname;
