-- First clean up any existing FAQs
DELETE FROM faqs WHERE id IS NOT NULL;

-- Insert new FAQs
INSERT INTO faqs (category, question, answer, order_num) VALUES
('Orders & Shipping', 'How can I track my order?', 'Once your order is shipped, you''ll receive a tracking number via email and SMS. You can use this number to track your order through our website or the courier partner''s tracking portal.', 1),
('Orders & Shipping', 'What are the shipping charges?', 'We offer free standard shipping on orders above ₹2999. For orders below this amount, a flat shipping fee of ₹99 applies. Express delivery is available at an additional cost of ₹199.', 2),
('Returns & Refunds', 'What is your return policy?', 'We accept returns within 30 days of delivery. Items must be unworn, unused, and in their original packaging with all tags attached. Some items like intimate wear and customized products are not eligible for return.', 3),
('Returns & Refunds', 'How long does it take to process a refund?', 'Once we receive your return, refunds are processed within 5-7 business days. The amount will be credited to your original payment method.', 4),
('Product & Sizing', 'How do I find my correct size?', 'You can refer to our detailed size guide available on each product page. We also have a comprehensive size guide section that provides measurements for all our categories.', 5);

-- Verify the data was inserted
SELECT * FROM faqs ORDER BY order_num;
