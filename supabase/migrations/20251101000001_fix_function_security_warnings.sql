-- Fix function security warnings by setting search_path and schema-qualifying references
-- This addresses the mutable search_path vulnerability in all SECURITY DEFINER functions

-- 1. Fix delete_product_with_audit_cleanup function
CREATE OR REPLACE FUNCTION public.delete_product_with_audit_cleanup(product_id uuid) 
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    audit_trigger_exists boolean;
    inventory_trigger_exists boolean;
    inventory_ids integer[];
BEGIN
    -- Check if triggers exist (schema-qualified references)
    SELECT EXISTS (
        SELECT 1 FROM pg_catalog.pg_trigger 
        WHERE tgname = 'product_audit_trigger'
    ) INTO audit_trigger_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_catalog.pg_trigger 
        WHERE tgname = 'trg_log_inventory_history'
    ) INTO inventory_trigger_exists;
    
    -- Disable triggers temporarily
    IF audit_trigger_exists THEN
        ALTER TABLE public.products DISABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN
        ALTER TABLE public.inventory DISABLE TRIGGER trg_log_inventory_history;
    END IF;
    
    -- Get all inventory IDs for this product (schema-qualified references)
    SELECT ARRAY(
        SELECT id FROM public.inventory WHERE public.inventory.product_id = delete_product_with_audit_cleanup.product_id
    ) INTO inventory_ids;
    
    -- Delete in the correct order to avoid foreign key conflicts
    
    -- 1. Delete inventory history for all inventory records
    IF array_length(inventory_ids, 1) > 0 THEN
        DELETE FROM public.inventory_history WHERE inventory_id = ANY(inventory_ids);
    END IF;
    
    -- 2. Delete audit logs
    DELETE FROM public.product_audit_log WHERE public.product_audit_log.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 3. Delete inventory records
    DELETE FROM public.inventory WHERE public.inventory.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 4. Delete product variants
    DELETE FROM public.product_variants WHERE public.product_variants.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 5. Delete product images
    DELETE FROM public.product_images WHERE public.product_images.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 6. Finally delete the product
    DELETE FROM public.products WHERE id = delete_product_with_audit_cleanup.product_id;
    
    -- Re-enable triggers
    IF audit_trigger_exists THEN
        ALTER TABLE public.products ENABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN
        ALTER TABLE public.inventory ENABLE TRIGGER trg_log_inventory_history;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Always re-enable triggers in case of error
    IF audit_trigger_exists THEN
        ALTER TABLE public.products ENABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN  
        ALTER TABLE public.inventory ENABLE TRIGGER trg_log_inventory_history;
    END IF;
    
    RAISE;
END;
$$;

-- 2. Fix change_customer_password function
CREATE OR REPLACE FUNCTION public.change_customer_password(p_email text, p_old_password text, p_new_password text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_customer_id uuid;
    v_stored_password text;
    v_temp_password text;
BEGIN
    -- Get customer data (schema-qualified)
    SELECT id, password, temp_password
    INTO v_customer_id, v_stored_password, v_temp_password
    FROM public.customers 
    WHERE email = p_email;
    
    IF v_customer_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Customer not found');
    END IF;
    
    -- Check if old password is correct (either regular or temp password)
    IF v_stored_password != crypt(p_old_password, v_stored_password) AND 
       (v_temp_password IS NULL OR v_temp_password != p_old_password) THEN
        RETURN json_build_object('success', false, 'error', 'Invalid current password');
    END IF;
    
    -- Update password (schema-qualified)
    UPDATE public.customers 
    SET 
        password = crypt(p_new_password, gen_salt('bf')),
        temp_password = NULL,
        password_changed_at = now()
    WHERE id = v_customer_id;
    
    RETURN json_build_object('success', true, 'message', 'Password changed successfully');
END;
$$;

-- 3. Fix clean_inventory_history_for_product function
CREATE OR REPLACE FUNCTION public.clean_inventory_history_for_product(product_id uuid) 
RETURNS integer
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.inventory_history 
    WHERE inventory_id IN (
        SELECT id FROM public.inventory 
        WHERE public.inventory.product_id = clean_inventory_history_for_product.product_id
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 4. Fix cleanup_expired_password_reset_tokens function
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_reset_tokens() 
RETURNS integer
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.customers 
    WHERE reset_token IS NOT NULL 
    AND reset_token_expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 5. Fix create_checkout_customer function
CREATE OR REPLACE FUNCTION public.create_checkout_customer(p_email text, p_first_name text, p_last_name text, p_phone text DEFAULT NULL::text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_customer_id uuid;
    existing_customer public.customers%ROWTYPE;
BEGIN
    -- Check if customer already exists (schema-qualified)
    SELECT * INTO existing_customer 
    FROM public.customers 
    WHERE email = p_email;
    
    IF existing_customer.id IS NOT NULL THEN
        -- Customer exists, return existing data
        RETURN json_build_object(
            'success', true,
            'customer_id', existing_customer.id,
            'email', existing_customer.email,
            'first_name', existing_customer.first_name,
            'last_name', existing_customer.last_name,
            'phone', existing_customer.phone,
            'is_new', false
        );
    END IF;
    
    -- Create new customer (schema-qualified)
    INSERT INTO public.customers (email, first_name, last_name, phone, is_guest)
    VALUES (p_email, p_first_name, p_last_name, p_phone, true)
    RETURNING id INTO v_customer_id;
    
    RETURN json_build_object(
        'success', true,
        'customer_id', v_customer_id,
        'email', p_email,
        'first_name', p_first_name,
        'last_name', p_last_name,
        'phone', p_phone,
        'is_new', true
    );
END;
$$;

-- 6. Fix customer_login function
CREATE OR REPLACE FUNCTION public.customer_login(user_email text, user_password text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    customer_record public.customers%ROWTYPE;
    is_valid_password boolean := false;
BEGIN
    -- Get customer record (schema-qualified)
    SELECT * INTO customer_record 
    FROM public.customers 
    WHERE email = user_email;
    
    IF customer_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
    
    -- Check password (regular or temporary)
    IF customer_record.password IS NOT NULL AND 
       customer_record.password = crypt(user_password, customer_record.password) THEN
        is_valid_password := true;
    ELSIF customer_record.temp_password IS NOT NULL AND 
          customer_record.temp_password = user_password THEN
        is_valid_password := true;
    END IF;
    
    IF NOT is_valid_password THEN
        RETURN json_build_object('success', false, 'error', 'Invalid email or password');
    END IF;
    
    -- Update last login (schema-qualified)
    UPDATE public.customers 
    SET last_login_at = now() 
    WHERE id = customer_record.id;
    
    RETURN json_build_object(
        'success', true,
        'customer_id', customer_record.id,
        'email', customer_record.email,
        'first_name', customer_record.first_name,
        'last_name', customer_record.last_name,
        'phone', customer_record.phone
    );
END;
$$;

-- 7. Fix customer_register function
CREATE OR REPLACE FUNCTION public.customer_register(user_email text, user_password text, user_first_name text, user_last_name text, user_phone text DEFAULT NULL::text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    new_customer_id uuid;
    existing_customer_id uuid;
BEGIN
    -- Check if customer already exists (schema-qualified)
    SELECT id INTO existing_customer_id 
    FROM public.customers 
    WHERE email = user_email;
    
    IF existing_customer_id IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Email already registered');
    END IF;
    
    -- Create new customer (schema-qualified)
    INSERT INTO public.customers (
        email, 
        password, 
        first_name, 
        last_name, 
        phone, 
        is_guest, 
        created_at
    )
    VALUES (
        user_email, 
        crypt(user_password, gen_salt('bf')), 
        user_first_name, 
        user_last_name, 
        user_phone, 
        false, 
        now()
    )
    RETURNING id INTO new_customer_id;
    
    RETURN json_build_object(
        'success', true,
        'customer_id', new_customer_id,
        'email', user_email,
        'first_name', user_first_name,
        'last_name', user_last_name,
        'phone', user_phone
    );
END;
$$;

-- 8. Fix generate_reset_token function
CREATE OR REPLACE FUNCTION public.generate_reset_token(user_email text) 
RETURNS json
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    customer_id uuid;
    reset_token text;
BEGIN
    -- Check if customer exists (schema-qualified)
    SELECT id INTO customer_id 
    FROM public.customers 
    WHERE email = user_email;
    
    IF customer_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Email not found');
    END IF;
    
    -- Generate reset token
    reset_token := public.generate_password_reset_token();
    
    -- Update customer with reset token (schema-qualified)
    UPDATE public.customers 
    SET 
        reset_token = reset_token,
        reset_token_expires_at = now() + interval '1 hour'
    WHERE id = customer_id;
    
    RETURN json_build_object(
        'success', true,
        'reset_token', reset_token,
        'customer_id', customer_id
    );
END;
$$;

-- 9. Fix get_razorpay_order_status function
CREATE OR REPLACE FUNCTION public.get_razorpay_order_status(p_order_id bigint) 
RETURNS TABLE(
    order_number character varying, 
    payment_status character varying, 
    razorpay_order_id character varying, 
    razorpay_payment_id character varying, 
    payment_method_used text, 
    amount_paid numeric
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_number,
        o.payment_status,
        o.razorpay_order_id,
        o.razorpay_payment_id,
        o.payment_method_used,
        o.total_amount
    FROM public.orders o
    WHERE o.id = p_order_id;
END;
$$;

-- 10. Fix get_setting_value function
CREATE OR REPLACE FUNCTION public.get_setting_value(setting_key text) 
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    setting_value text;
BEGIN
    SELECT value INTO setting_value 
    FROM public.settings 
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$;

-- 11. Fix get_settings_by_category function
CREATE OR REPLACE FUNCTION public.get_settings_by_category(category_name text) 
RETURNS TABLE(
    key text, 
    value text, 
    data_type text, 
    description text, 
    is_required boolean, 
    default_value text, 
    is_encrypted boolean
)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.key,
        s.value,
        s.data_type,
        s.description,
        s.is_required,
        s.default_value,
        s.is_encrypted
    FROM public.settings s
    WHERE s.category = category_name
    ORDER BY s.key;
END;
$$;

-- 12. Fix utility functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_invoice_number() 
RETURNS character varying
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    prefix text := 'INV';
    next_number integer;
    invoice_number text;
BEGIN
    -- Get next sequence number (schema-qualified)
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS integer)), 0) + 1
    INTO next_number
    FROM public.orders 
    WHERE invoice_number IS NOT NULL 
    AND invoice_number ~ '^INV[0-9]+$';
    
    invoice_number := prefix || LPAD(next_number::text, 6, '0');
    RETURN invoice_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_password_reset_token() 
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_refund_transaction_number() 
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    prefix text := 'RFD';
    next_number integer;
    transaction_number text;
BEGIN
    -- Get next sequence number (schema-qualified)
    SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 4) AS integer)), 0) + 1
    INTO next_number
    FROM public.razorpay_refund_transactions 
    WHERE transaction_number IS NOT NULL 
    AND transaction_number ~ '^RFD[0-9]+$';
    
    transaction_number := prefix || LPAD(next_number::text, 8, '0');
    RETURN transaction_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_return_number() 
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    prefix text := 'RET';
    next_number integer;
    return_number text;
BEGIN
    -- Get next sequence number (schema-qualified)
    SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 4) AS integer)), 0) + 1
    INTO next_number
    FROM public.return_requests 
    WHERE return_number IS NOT NULL 
    AND return_number ~ '^RET[0-9]+$';
    
    return_number := prefix || LPAD(next_number::text, 8, '0');
    RETURN return_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_temp_password() 
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN upper(encode(gen_random_bytes(4), 'hex'));
END;
$$;

-- 13. Fix admin utility functions
CREATE OR REPLACE FUNCTION public.create_public_read_policy(table_name text) 
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    EXECUTE format('CREATE POLICY "Public read access" ON public.%I FOR SELECT USING (true)', table_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.exec_sql(sql text) 
RETURNS void
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    EXECUTE sql;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_table_analysis() 
RETURNS TABLE(table_name text, rls_enabled text, policy_count bigint, status text)
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        CASE WHEN t.rowsecurity THEN 'Enabled' ELSE 'Disabled' END::text,
        COALESCE(p.policy_count, 0),
        CASE 
            WHEN t.rowsecurity AND COALESCE(p.policy_count, 0) > 0 THEN 'Protected'
            WHEN t.rowsecurity AND COALESCE(p.policy_count, 0) = 0 THEN 'RLS Enabled, No Policies'
            ELSE 'Unprotected'
        END::text
    FROM pg_catalog.pg_tables t
    LEFT JOIN (
        SELECT schemaname, tablename, COUNT(*) as policy_count
        FROM pg_catalog.pg_policies
        GROUP BY schemaname, tablename
    ) p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
    WHERE t.schemaname = 'public'
    ORDER BY t.tablename;
END;
$$;

-- Tighten permissions on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.delete_product_with_audit_cleanup(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_product_with_audit_cleanup(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.change_customer_password(text, text, text) FROM PUBLIC;  
GRANT EXECUTE ON FUNCTION public.change_customer_password(text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.customer_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_login(text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.customer_register(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.customer_register(text, text, text, text, text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.generate_reset_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_reset_token(text) TO anon, authenticated;

-- Admin-only functions
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

COMMENT ON FUNCTION public.delete_product_with_audit_cleanup(uuid) IS 'Securely deletes a product and all related data with proper search_path isolation';
COMMENT ON FUNCTION public.change_customer_password(text, text, text) IS 'Securely changes customer password with proper search_path isolation';
COMMENT ON FUNCTION public.customer_login(text, text) IS 'Securely authenticates customer with proper search_path isolation';
COMMENT ON FUNCTION public.customer_register(text, text, text, text, text) IS 'Securely registers new customer with proper search_path isolation';