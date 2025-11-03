-- FIX ORDER CREATION RLS POLICIES
-- Restore proper policies for order creation flow

-- =============================================================================
-- CHECK CURRENT ORDERS POLICIES
-- =============================================================================

SELECT 
    p.polname as policyname,
    p.polcmd as command_type,
    p.polroles::regrole[] as roles,
    pg_get_expr(p.polqual, p.polrelid) as using_expression,
    pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname = 'orders'
ORDER BY p.polname;