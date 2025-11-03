-- ============================================================================
-- MINIMAL VERIFICATION - Run these ONE AT A TIME
-- ============================================================================

-- STEP 1: Check if pgcrypto is enabled
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';
-- Expected: Should return 'pgcrypto'

-- STEP 2: Check if is_guest column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'is_guest';
-- Expected: Should return 'is_guest'

-- STEP 3: Check if create_checkout_customer function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'create_checkout_customer';
-- Expected: Should return 'create_checkout_customer'

-- STEP 4: Count existing customers
SELECT COUNT(*) as total_customers FROM customers;
-- Expected: Should return a number

-- STEP 5: Test the checkout function (ONLY if steps 1-4 pass)
-- This will create a test customer
SELECT create_checkout_customer(
    'test-verify@example.com',
    'Test',
    'Verification',
    '9999999999'
);
-- Expected: Should return JSON with success=true and customer data

-- STEP 6: Clean up test customer (run after step 5)
DELETE FROM customers WHERE email = 'test-verify@example.com';
-- Expected: Should delete 1 row
