/**
 * Database Diagnostic Script
 * Run this in Supabase SQL Editor to check what's missing
 */

-- ====================================
-- 1. CHECK CUSTOMERS TABLE STRUCTURE
-- ====================================
SELECT 
    'customers_columns' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'customers'
ORDER BY ordinal_position;

-- ====================================
-- 2. CHECK IF WELCOME EMAIL COLUMNS EXIST
-- ====================================
SELECT 
    'welcome_email_columns_check' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'welcome_email_sent'
    ) as has_welcome_email_sent,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'welcome_email_sent_at'
    ) as has_welcome_email_sent_at;

-- ====================================
-- 3. CHECK IF PASSWORD RESET COLUMNS EXIST
-- ====================================
SELECT 
    'password_reset_columns_check' as check_type,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'reset_token'
    ) as has_reset_token,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'reset_token_expires'
    ) as has_reset_token_expires;

-- ====================================
-- 4. CHECK EXISTING RPC FUNCTIONS
-- ====================================
SELECT 
    'existing_functions' as check_type,
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'create_checkout_customer',
        'mark_welcome_email_sent',
        'request_password_reset',
        'reset_password_with_token',
        'update_customer_profile'
    )
ORDER BY routine_name;

-- ====================================
-- 5. CHECK create_checkout_customer FUNCTION DETAILS
-- ====================================
SELECT 
    'create_checkout_customer_details' as check_type,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname = 'create_checkout_customer';

-- ====================================
-- 6. CHECK ORDERS TABLE STRUCTURE
-- ====================================
SELECT 
    'orders_columns' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'orders'
    AND column_name IN (
        'customer_id',
        'payment_transaction_id',
        'razorpay_payment_id',
        'razorpay_order_id',
        'payment_details'
    )
ORDER BY ordinal_position;

-- ====================================
-- 7. CHECK CUSTOMER ID DATA TYPE
-- ====================================
SELECT 
    'customer_id_type_check' as check_type,
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND column_name = 'id'
    AND table_name = 'customers';

-- ====================================
-- 8. TEST create_checkout_customer FUNCTION
-- ====================================
-- Uncomment to test (use a test email)
-- SELECT 'function_test' as check_type, 
--     create_checkout_customer(
--         'test@example.com',
--         'Test',
--         'User',
--         '1234567890'
--     ) as result;

-- ====================================
-- 9. CHECK RLS POLICIES ON CUSTOMERS TABLE
-- ====================================
SELECT 
    'customers_rls_policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'customers'
ORDER BY policyname;

-- ====================================
-- 10. CHECK GRANTS ON CUSTOMERS TABLE
-- ====================================
SELECT 
    'customers_grants' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND table_name = 'customers'
ORDER BY grantee, privilege_type;
