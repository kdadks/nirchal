-- DIRECT POLICY INSPECTION AND FIX
-- First, let's see the actual policy definitions to understand why they're not updating

-- =============================================================================
-- PART 1: INSPECT CURRENT POLICIES
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual as using_clause,
    with_check as with_check_clause,
    CASE 
        WHEN cmd = 'INSERT' THEN 'Uses WITH CHECK'
        WHEN cmd IN ('SELECT', 'UPDATE', 'DELETE') THEN 'Uses USING'
        WHEN cmd = 'ALL' THEN 'Uses BOTH'
    END as clause_type
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('customers', 'vendors', 'hero_slides', 'return_requests', 
                  'invoices', 'return_items', 'return_status_history', 
                  'razorpay_refund_transactions')
ORDER BY tablename, policyname;

-- =============================================================================
-- PART 2: CHECK CURRENT RLS STATUS
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('customers', 'vendors', 'hero_slides', 'return_requests', 
                  'invoices', 'return_items', 'return_status_history', 
                  'razorpay_refund_transactions')
ORDER BY tablename;

-- =============================================================================
-- PART 3: CHECK IF POLICIES ARE USING ROLES
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('customers', 'vendors', 'hero_slides', 'return_requests', 
                  'invoices', 'return_items', 'return_status_history', 
                  'razorpay_refund_transactions')
ORDER BY tablename, policyname;