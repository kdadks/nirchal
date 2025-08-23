-- Enable customer creation for anonymous users during checkout
-- Run this in Supabase SQL editor

-- Ensure customers table allows anonymous inserts for checkout
DO $$
BEGIN
  -- Enable RLS on customers table
  ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing insert policy if exists
  DROP POLICY IF EXISTS customers_anonymous_insert ON public.customers;
  
  -- Create policy to allow anonymous users to create customer records during checkout
  CREATE POLICY customers_anonymous_insert ON public.customers
    FOR INSERT TO anon
    WITH CHECK (true);
    
  -- Ensure anon users can insert into customers table
  GRANT INSERT ON public.customers TO anon;
  
  -- Also allow authenticated users to insert
  DROP POLICY IF EXISTS customers_auth_insert ON public.customers;
  CREATE POLICY customers_auth_insert ON public.customers
    FOR INSERT TO authenticated
    WITH CHECK (true);
    
  GRANT INSERT ON public.customers TO authenticated;
END $$;

-- Verify the policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers' 
  AND cmd = 'INSERT';

-- Verify grants
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'customers' 
  AND privilege_type = 'INSERT';
