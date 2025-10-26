-- Clean up and fix return_requests RLS policies
-- Migration: 20251026000002

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all return request operations" ON return_requests;
DROP POLICY IF EXISTS "Admins can update all return requests" ON return_requests;
DROP POLICY IF EXISTS "Customers can create own returns" ON return_requests;
DROP POLICY IF EXISTS "Customers can create return requests" ON return_requests;
DROP POLICY IF EXISTS "Customers can update own return tracking" ON return_requests;
DROP POLICY IF EXISTS "Customers can update their own pending returns" ON return_requests;
DROP POLICY IF EXISTS "Customers can view own returns" ON return_requests;

-- Note: We use supabaseAdmin (service role) for all operations which bypasses RLS
-- These policies are just for safety and future-proofing
-- The returnService.ts uses this.db which is supabaseAdmin

-- Simple permissive policy: Allow authenticated users to view their own returns
CREATE POLICY "authenticated_users_select_own" 
  ON return_requests
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Simple permissive policy: Allow authenticated users to create their own returns  
CREATE POLICY "authenticated_users_insert_own"
  ON return_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Simple permissive policy: Allow authenticated users to update their own returns
CREATE POLICY "authenticated_users_update_own"
  ON return_requests
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Comments
COMMENT ON POLICY "authenticated_users_select_own" ON return_requests IS 'Customers can view their own return requests';
COMMENT ON POLICY "authenticated_users_insert_own" ON return_requests IS 'Customers can create their own return requests';
COMMENT ON POLICY "authenticated_users_update_own" ON return_requests IS 'Customers can update their own return requests';
