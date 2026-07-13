-- ============================================================================
-- CREATE ORDER WITH ITEMS RPC FUNCTION
-- This bypasses RLS issues by running with SECURITY DEFINER
-- The function handles both order and order_items insertion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_order_checkout(
  p_order_number text,
  p_customer_id uuid,
  p_payment_method text,
  p_currency text,
  p_subtotal numeric,
  p_shipping_amount numeric,
  p_shipping_method text,
  p_express_delivery_fee numeric,
  p_total_amount numeric,
  p_billing_first_name text,
  p_billing_last_name text,
  p_billing_address_line_1 text,
  p_billing_address_line_2 text,
  p_billing_city text,
  p_billing_state text,
  p_billing_postal_code text,
  p_billing_country text,
  p_billing_phone text,
  p_billing_email text,
  p_shipping_first_name text,
  p_shipping_last_name text,
  p_shipping_address_line_1 text,
  p_shipping_address_line_2 text,
  p_shipping_city text,
  p_shipping_state text,
  p_shipping_postal_code text,
  p_shipping_country text,
  p_shipping_phone text,
  p_cod_amount numeric DEFAULT 0,
  p_cod_collected boolean DEFAULT false,
  p_online_amount numeric DEFAULT 0,
  p_payment_split boolean DEFAULT false,
  p_items_json jsonb DEFAULT '[]'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_order_id bigint;
  v_item jsonb;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (
    order_number,
    customer_id,
    status,
    payment_status,
    payment_method,
    currency,
    subtotal,
    tax_amount,
    shipping_amount,
    shipping_method,
    express_delivery_fee,
    discount_amount,
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
    shipping_phone,
    cod_amount,
    cod_collected,
    online_amount,
    payment_split
  ) VALUES (
    p_order_number,
    p_customer_id,
    'pending',
    'pending',
    p_payment_method,
    p_currency,
    p_subtotal,
    0,
    p_shipping_amount,
    p_shipping_method,
    p_express_delivery_fee,
    0,
    p_total_amount,
    p_billing_first_name,
    p_billing_last_name,
    p_billing_address_line_1,
    p_billing_address_line_2,
    p_billing_city,
    p_billing_state,
    p_billing_postal_code,
    p_billing_country,
    p_billing_phone,
    p_billing_email,
    p_shipping_first_name,
    p_shipping_last_name,
    p_shipping_address_line_1,
    p_shipping_address_line_2,
    p_shipping_city,
    p_shipping_state,
    p_shipping_postal_code,
    p_shipping_country,
    p_shipping_phone,
    p_cod_amount,
    p_cod_collected,
    p_online_amount,
    p_payment_split
  )
  RETURNING id INTO v_order_id;

  -- Insert order items if provided
  IF p_items_json IS NOT NULL AND jsonb_array_length(p_items_json) > 0 THEN
    FOR v_item IN SELECT jsonb_array_elements(p_items_json)
    LOOP
      INSERT INTO public.order_items (
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
      ) VALUES (
        v_order_id,
        v_item->>'product_id',
        v_item->>'product_variant_id',
        v_item->>'product_name',
        v_item->>'product_sku',
        v_item->>'variant_size',
        v_item->>'variant_color',
        v_item->>'variant_material',
        (v_item->>'unit_price')::numeric,
        (v_item->>'quantity')::integer,
        (v_item->>'total_price')::numeric
      );
    END LOOP;
  END IF;

  -- Return the created order
  RETURN json_build_object(
    'id', v_order_id,
    'order_number', p_order_number
  );
END;
$$;

-- Grant execute to public and authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_checkout(
  text, uuid, text, text, numeric, numeric, text, numeric, numeric,
  text, text, text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text, text, text,
  numeric, boolean, numeric, boolean, jsonb
) TO public, authenticated, service_role;
