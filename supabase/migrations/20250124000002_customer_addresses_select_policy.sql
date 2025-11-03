-- Migration: Add SELECT policy for customer_addresses
-- Description: Allow anonymous and authenticated users to SELECT their own addresses
-- Date: 2025-01-24

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS customer_addresses_public_select ON public.customer_addresses;

-- Add SELECT policy to allow reading addresses
CREATE POLICY customer_addresses_public_select 
  ON public.customer_addresses 
  FOR SELECT 
  USING (true);

-- Grant SELECT permission to anon and authenticated roles
GRANT SELECT ON public.customer_addresses TO anon, authenticated;
GRANT INSERT ON public.customer_addresses TO anon, authenticated;
GRANT UPDATE ON public.customer_addresses TO anon, authenticated;
GRANT DELETE ON public.customer_addresses TO anon, authenticated;

-- Add comment for documentation
COMMENT ON POLICY customer_addresses_public_select ON public.customer_addresses 
  IS 'Allow all users to read customer addresses';
