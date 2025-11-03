-- ============================================================================
-- FINAL CHECKOUT TEST
-- This will verify the checkout flow works end-to-end
-- ============================================================================

-- Test 1: Create a new customer through checkout
SELECT create_checkout_customer(
    'final-test@example.com',
    'Final',
    'Test',
    '1234567890'
) as new_customer_result;

-- Test 2: Verify the customer was created with correct flags
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_guest,
    welcome_email_sent,
    password_change_required
FROM customers 
WHERE email = 'final-test@example.com';

-- Test 3: Try creating the same customer again (should return existing)
SELECT create_checkout_customer(
    'final-test@example.com',
    'Final',
    'Test',
    '1234567890'
) as existing_customer_result;

-- Test 4: Clean up test data
DELETE FROM customers WHERE email = 'final-test@example.com';
