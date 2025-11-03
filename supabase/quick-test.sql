-- ============================================================================
-- QUICK CHECKOUT TEST
-- ============================================================================

-- Test the create_checkout_customer function
SELECT create_checkout_customer(
    'quick-test@example.com',
    'Quick',
    'Test',
    '9876543210'
);

-- If successful, clean up
-- DELETE FROM customers WHERE email = 'quick-test@example.com';
