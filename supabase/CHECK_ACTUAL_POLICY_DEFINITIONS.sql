-- CHECK ACTUAL POLICY DEFINITIONS
-- Let's see the raw policy text to verify if optimization worked

SELECT 
    c.relname as tablename,
    p.polname as policyname,
    p.polcmd as cmd,
    pg_get_expr(p.polqual, p.polrelid) as using_expression,
    pg_get_expr(p.polwithcheck, p.polrelid) as with_check_expression
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname IN ('customers', 'vendors', 'hero_slides', 'return_requests', 
                  'invoices', 'return_items', 'return_status_history', 
                  'razorpay_refund_transactions')
ORDER BY c.relname, p.polname;