-- Migration: Add set_config RPC Function
-- Description: Create RPC function to set Postgres configuration variables for RLS policies
-- Date: 2026-07-13
-- 
-- NOTE: For the orders table, the RLS policy has been updated separately to allow
-- authenticated users to insert orders directly. This set_config function is available
-- for general use with other policies that may depend on configuration variables.

-- ============================================================================
-- Function: set_config
-- Description: Set a Postgres configuration variable for use in RLS policies
-- Security: INVOKER - runs as the calling user
-- Usage: supabase.rpc('set_config', { config_name: 'config_key', config_value: 'value' })
-- 
-- WARNING: Config variables set via RPC may not persist across multiple requests since
-- each HTTP request creates a new database connection. For robust RLS policies, prefer
-- using auth.uid() or similar authenticated context directly in the policy instead.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_config(
  config_name text,
  config_value text,
  is_local boolean DEFAULT false
)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT set_config(config_name, config_value, is_local);
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.set_config(text, text, boolean) TO authenticated, anon;
