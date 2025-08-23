-- Quick test to check if the temp password functions exist and work
-- Run this first to verify the system is set up

-- Check if functions exist
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname IN ('generate_temp_password', 'create_checkout_customer', 'change_customer_password');

-- Check if columns exist in customers table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
  AND column_name IN ('temp_password', 'password_change_required', 'temp_password_created_at');

-- Test the functions if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_temp_password') THEN
        RAISE NOTICE 'Testing generate_temp_password: %', generate_temp_password();
    ELSE
        RAISE NOTICE 'Function generate_temp_password does not exist';
    END IF;
END $$;
