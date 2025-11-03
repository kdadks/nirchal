-- ============================================================================
-- SINGLE COMMAND FIX - Copy and paste this entire block
-- ============================================================================

-- Drop and recreate the function with correct search_path
DROP FUNCTION IF EXISTS public.create_checkout_customer(text, text, text, text);

CREATE FUNCTION public.create_checkout_customer(
  p_email text, 
  p_first_name text, 
  p_last_name text, 
  p_phone text DEFAULT NULL::text
) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    customer_record customers%ROWTYPE;
    temp_password TEXT;
    customer_id UUID;
    needs_welcome BOOLEAN := false;
BEGIN
    SELECT * INTO customer_record FROM customers WHERE email = p_email;
    
    IF FOUND THEN
        UPDATE customers 
        SET 
            first_name = COALESCE(p_first_name, first_name),
            last_name = COALESCE(p_last_name, last_name),
            phone = COALESCE(p_phone, phone),
            updated_at = NOW()
        WHERE id = customer_record.id;
        
        needs_welcome := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'success', true,
            'id', customer_record.id,
            'customer_id', customer_record.id,
            'email', customer_record.email,
            'first_name', customer_record.first_name,
            'last_name', customer_record.last_name,
            'phone', customer_record.phone,
            'temp_password', NULL,
            'existing_customer', true,
            'is_new', false,
            'needs_welcome_email', needs_welcome
        );
    ELSE
        temp_password := upper(substring(md5(random()::text) from 1 for 8));
        
        INSERT INTO customers (
            email, password_hash, first_name, last_name, phone, 
            welcome_email_sent, is_guest, created_at, updated_at
        )
        VALUES (
            p_email, crypt(temp_password, gen_salt('bf')), p_first_name, p_last_name, p_phone,
            false, true, NOW(), NOW()
        )
        RETURNING id INTO customer_id;
        
        RETURN json_build_object(
            'success', true,
            'id', customer_id,
            'customer_id', customer_id,
            'email', p_email,
            'first_name', p_first_name,
            'last_name', p_last_name,
            'phone', p_phone,
            'temp_password', temp_password,
            'existing_customer', false,
            'is_new', true,
            'needs_welcome_email', true
        );
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        SELECT * INTO customer_record FROM customers WHERE email = p_email;
        needs_welcome := NOT COALESCE(customer_record.welcome_email_sent, false);
        
        RETURN json_build_object(
            'success', true,
            'id', customer_record.id,
            'customer_id', customer_record.id,
            'email', customer_record.email,
            'temp_password', NULL,
            'existing_customer', true,
            'is_new', false,
            'needs_welcome_email', needs_welcome
        );
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create checkout customer: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_checkout_customer(text, text, text, text) TO authenticated, anon;
