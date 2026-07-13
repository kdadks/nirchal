-- ============================================================================
-- RPC: get_recovery_order(p_order_number)
--
-- PURPOSE: Fetch order + items for checkout recovery, bypassing RLS.
--   The orders table only allows SELECT via the customer's session cookie
--   (app.current_customer_id). Recovery links are opened in fresh sessions
--   where that setting isn't present, so a direct table query returns 0 rows.
--
-- SECURITY: SECURITY DEFINER bypasses RLS. The order_number is the auth
--   factor — it is high-entropy (ORD-YYYYMMDD-######) and cannot be guessed
--   by enumeration. Only safe fields for form pre-fill are returned; payment
--   credentials (razorpay_payment_id, payment_details) are excluded.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_recovery_order(p_order_number text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order       record;
  v_items       json;
BEGIN
  -- Fetch the order (safe fields only — no payment credentials)
  SELECT
    id,
    order_number,
    status,
    payment_method,
    currency,
    subtotal,
    shipping_amount,
    shipping_method,
    total_amount,
    billing_first_name,
    billing_last_name,
    billing_address_line_1,
    billing_address_line_2,
    billing_city,
    billing_state,
    billing_postal_code,
    billing_country,
    billing_phone,
    billing_email,
    shipping_first_name,
    shipping_last_name,
    shipping_address_line_1,
    shipping_address_line_2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    shipping_country,
    shipping_phone
  INTO v_order
  FROM public.orders
  WHERE order_number = p_order_number
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Fetch order items
  SELECT json_agg(i)
  INTO v_items
  FROM (
    SELECT
      id,
      order_id,
      product_id,
      product_variant_id,
      product_name,
      product_sku,
      variant_size,
      variant_color,
      variant_material,
      unit_price,
      quantity,
      total_price
    FROM public.order_items
    WHERE order_id = v_order.id
  ) i;

  RETURN json_build_object(
    'order', row_to_json(v_order),
    'items', COALESCE(v_items, '[]'::json)
  );
END;
$$;

-- Grant to all roles (anon users following recovery links need this)
GRANT EXECUTE ON FUNCTION public.get_recovery_order(text) TO public, anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
