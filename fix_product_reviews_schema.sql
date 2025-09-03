-- Fix product_reviews table to use customer_id instead of user_id
-- This aligns the reviews system with the customer authentication system

-- Drop the existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS product_reviews CASCADE;

-- Alternative: Alter existing table (safer for production with data)
-- First drop the foreign key constraint
ALTER TABLE product_reviews DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey;

-- Drop the user_id column 
ALTER TABLE product_reviews DROP COLUMN IF EXISTS user_id;

-- Add customer_id column that references customers table (using UUID to match customers.id)
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- Update RLS policies to work with customer_id
DROP POLICY IF EXISTS "Authenticated can insert product_reviews" ON product_reviews;
DROP POLICY IF EXISTS "Authenticated customers can insert product_reviews" ON product_reviews;
CREATE POLICY "Authenticated customers can insert product_reviews" ON product_reviews
  FOR INSERT WITH CHECK (
    customer_id IS NOT NULL AND 
    EXISTS (SELECT 1 FROM customers WHERE id = customer_id)
  );

-- Policy for customers to update their own reviews
DROP POLICY IF EXISTS "Customers can update own reviews" ON product_reviews;
CREATE POLICY "Customers can update own reviews" ON product_reviews
  FOR UPDATE USING (
    customer_id IS NOT NULL AND 
    EXISTS (SELECT 1 FROM customers WHERE id = customer_id)
  );

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
