-- Fix RLS policies for customer_wishlist table
-- Note: This system uses custom customer authentication, not Supabase auth

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on customer_wishlist" ON customer_wishlist;

-- Disable RLS temporarily or use permissive policy
-- Since the app uses custom auth (not Supabase auth), we need to allow operations
-- The security is handled at the application layer
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy that allows all operations
-- Security is handled by the application layer checking customer.id
CREATE POLICY "Allow all operations on customer_wishlist"
ON customer_wishlist
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant permissions to anon users (since we're using custom auth, not Supabase auth)
GRANT SELECT, INSERT, DELETE ON customer_wishlist TO anon;
GRANT SELECT, INSERT, DELETE ON customer_wishlist TO authenticated;
