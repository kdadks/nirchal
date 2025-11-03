-- Migration: Customer Addresses RPC Functions
-- Description: Create RPC functions for customer address CRUD operations to bypass RLS restrictions
-- Date: 2025-01-24

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- ============================================================================
-- Function: insert_customer_address
-- Description: Insert a new customer address with proper permissions
-- Security: DEFINER to bypass RLS restrictions
-- ============================================================================
CREATE OR REPLACE FUNCTION public.insert_customer_address(
  p_customer_id uuid,
  p_first_name text,
  p_last_name text,
  p_address_line_1 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_company text DEFAULT NULL,
  p_address_line_2 text DEFAULT NULL,
  p_country text DEFAULT 'India',
  p_phone text DEFAULT NULL,
  p_is_default boolean DEFAULT false,
  p_is_billing boolean DEFAULT false,
  p_is_shipping boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_address_id integer;
  v_result json;
BEGIN
  -- If this address should be default, remove default flag from other addresses
  IF p_is_default THEN
    UPDATE public.customer_addresses
    SET is_default = false
    WHERE customer_id = p_customer_id
      AND is_default = true;
  END IF;

  -- Insert the new address (omit id column to let IDENTITY generate it)
  INSERT INTO public.customer_addresses (
    customer_id,
    first_name,
    last_name,
    company,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    country,
    phone,
    is_default,
    is_billing,
    is_shipping
  ) VALUES (
    p_customer_id,
    TRIM(p_first_name),
    TRIM(p_last_name),
    NULLIF(TRIM(p_company), ''),
    TRIM(p_address_line_1),
    NULLIF(TRIM(p_address_line_2), ''),
    TRIM(p_city),
    TRIM(p_state),
    TRIM(p_postal_code),
    COALESCE(TRIM(p_country), 'India'),
    NULLIF(TRIM(p_phone), ''),
    p_is_default,
    p_is_billing,
    p_is_shipping
  )
  RETURNING id INTO v_address_id;

  -- Return the created address details
  SELECT json_build_object(
    'id', id,
    'customer_id', customer_id,
    'first_name', first_name,
    'last_name', last_name,
    'company', company,
    'address_line_1', address_line_1,
    'address_line_2', address_line_2,
    'city', city,
    'state', state,
    'postal_code', postal_code,
    'country', country,
    'phone', phone,
    'is_default', is_default,
    'is_billing', is_billing,
    'is_shipping', is_shipping,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM public.customer_addresses
  WHERE id = v_address_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- Function: update_customer_address
-- Description: Update an existing customer address with proper permissions
-- Security: DEFINER to bypass RLS restrictions
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_customer_address(
  p_address_id integer,
  p_customer_id uuid,
  p_first_name text,
  p_last_name text,
  p_address_line_1 text,
  p_city text,
  p_state text,
  p_postal_code text,
  p_company text DEFAULT NULL,
  p_address_line_2 text DEFAULT NULL,
  p_country text DEFAULT 'India',
  p_phone text DEFAULT NULL,
  p_is_default boolean DEFAULT false,
  p_is_billing boolean DEFAULT false,
  p_is_shipping boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_result json;
BEGIN
  -- Verify that the address belongs to the customer
  IF NOT EXISTS (
    SELECT 1 FROM public.customer_addresses
    WHERE id = p_address_id AND customer_id = p_customer_id
  ) THEN
    RAISE EXCEPTION 'Address not found or does not belong to customer';
  END IF;

  -- If this address should be default, remove default flag from other addresses
  IF p_is_default THEN
    UPDATE public.customer_addresses
    SET is_default = false
    WHERE customer_id = p_customer_id
      AND id != p_address_id
      AND is_default = true;
  END IF;

  -- Update the address
  UPDATE public.customer_addresses
  SET
    first_name = TRIM(p_first_name),
    last_name = TRIM(p_last_name),
    company = NULLIF(TRIM(p_company), ''),
    address_line_1 = TRIM(p_address_line_1),
    address_line_2 = NULLIF(TRIM(p_address_line_2), ''),
    city = TRIM(p_city),
    state = TRIM(p_state),
    postal_code = TRIM(p_postal_code),
    country = COALESCE(TRIM(p_country), 'India'),
    phone = NULLIF(TRIM(p_phone), ''),
    is_default = p_is_default,
    is_billing = p_is_billing,
    is_shipping = p_is_shipping,
    updated_at = NOW()
  WHERE id = p_address_id
    AND customer_id = p_customer_id;

  -- Return the updated address details
  SELECT json_build_object(
    'id', id,
    'customer_id', customer_id,
    'first_name', first_name,
    'last_name', last_name,
    'company', company,
    'address_line_1', address_line_1,
    'address_line_2', address_line_2,
    'city', city,
    'state', state,
    'postal_code', postal_code,
    'country', country,
    'phone', phone,
    'is_default', is_default,
    'is_billing', is_billing,
    'is_shipping', is_shipping,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM public.customer_addresses
  WHERE id = p_address_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- Function: delete_customer_address
-- Description: Delete a customer address with proper permissions
-- Security: DEFINER to bypass RLS restrictions
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delete_customer_address(
  p_address_id integer,
  p_customer_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_was_default boolean;
  v_result json;
BEGIN
  -- Verify that the address belongs to the customer
  SELECT is_default INTO v_was_default
  FROM public.customer_addresses
  WHERE id = p_address_id AND customer_id = p_customer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or does not belong to customer';
  END IF;

  -- Delete the address
  DELETE FROM public.customer_addresses
  WHERE id = p_address_id
    AND customer_id = p_customer_id;

  -- If the deleted address was the default, set the first remaining address as default
  IF v_was_default THEN
    UPDATE public.customer_addresses
    SET is_default = true
    WHERE customer_id = p_customer_id
      AND id = (
        SELECT id FROM public.customer_addresses
        WHERE customer_id = p_customer_id
        ORDER BY created_at ASC
        LIMIT 1
      );
  END IF;

  -- Return success message
  v_result := json_build_object(
    'success', true,
    'message', 'Address deleted successfully',
    'deleted_id', p_address_id
  );

  RETURN v_result;
END;
$$;

-- ============================================================================
-- Grant execute permissions to anon and authenticated roles
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.insert_customer_address TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_address TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_customer_address TO anon, authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON FUNCTION public.insert_customer_address IS 'Insert a new customer address with SECURITY DEFINER to bypass RLS';
COMMENT ON FUNCTION public.update_customer_address IS 'Update an existing customer address with SECURITY DEFINER to bypass RLS';
COMMENT ON FUNCTION public.delete_customer_address IS 'Delete a customer address with SECURITY DEFINER to bypass RLS';
