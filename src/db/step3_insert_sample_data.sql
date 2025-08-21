-- Step 3: Insert sample data
-- Execute this after Step 2

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone) 
VALUES 
('Priya', 'Sharma', 'priya.sharma@email.com', '+91 98765 43210'),
('Arjun', 'Patel', 'arjun.patel@email.com', '+91 98765 43211'),
('Meera', 'Singh', 'meera.singh@email.com', '+91 98765 43212'),
('Rohit', 'Kumar', 'rohit.kumar@email.com', '+91 98765 43213'),
('Anita', 'Gupta', 'anita.gupta@email.com', '+91 98765 43214'),
('Vikram', 'Joshi', 'vikram.joshi@email.com', '+91 98765 43215')
ON CONFLICT (email) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (order_number, customer_id, status, payment_status, payment_method, 
    subtotal, tax_amount, shipping_amount, total_amount,
    billing_first_name, billing_last_name, billing_address_line_1, billing_city, billing_state, billing_postal_code, billing_email,
    shipping_first_name, shipping_last_name, shipping_address_line_1, shipping_city, shipping_state, shipping_postal_code,
    created_at) 
VALUES 
('ORD-001', 1, 'processing', 'paid', 'razorpay', 2124.15, 374.85, 0, 2499.00,
    'Priya', 'Sharma', '123 MG Road', 'Mumbai', 'Maharashtra', '400001', 'priya.sharma@email.com',
    'Priya', 'Sharma', '123 MG Road', 'Mumbai', 'Maharashtra', '400001',
    NOW() - INTERVAL '2 minutes'),
('ORD-002', 2, 'shipped', 'paid', 'stripe', 3644.07, 654.93, 0, 4299.00,
    'Arjun', 'Patel', '456 Park Street', 'Kolkata', 'West Bengal', '700016', 'arjun.patel@email.com',
    'Arjun', 'Patel', '456 Park Street', 'Kolkata', 'West Bengal', '700016',
    NOW() - INTERVAL '15 minutes'),
('ORD-003', 3, 'delivered', 'paid', 'cod', 1610.17, 288.83, 0, 1899.00,
    'Meera', 'Singh', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001', 'meera.singh@email.com',
    'Meera', 'Singh', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001',
    NOW() - INTERVAL '1 hour'),
('ORD-004', 4, 'processing', 'paid', 'razorpay', 3050.85, 548.15, 0, 3599.00,
    'Rohit', 'Kumar', '321 CP', 'New Delhi', 'Delhi', '110001', 'rohit.kumar@email.com',
    'Rohit', 'Kumar', '321 CP', 'New Delhi', 'Delhi', '110001',
    NOW() - INTERVAL '2 hours'),
('ORD-005', 5, 'delivered', 'paid', 'razorpay', 4237.29, 761.71, 0, 4999.00,
    'Anita', 'Gupta', '654 FC Road', 'Pune', 'Maharashtra', '411005', 'anita.gupta@email.com',
    'Anita', 'Gupta', '654 FC Road', 'Pune', 'Maharashtra', '411005',
    NOW() - INTERVAL '1 day'),
('ORD-006', 6, 'shipped', 'paid', 'stripe', 6779.66, 1219.34, 0, 7999.00,
    'Vikram', 'Joshi', '987 Mall Road', 'Shimla', 'Himachal Pradesh', '171001', 'vikram.joshi@email.com',
    'Vikram', 'Joshi', '987 Mall Road', 'Shimla', 'Himachal Pradesh', '171001',
    NOW() - INTERVAL '2 days')
ON CONFLICT (order_number) DO NOTHING;
