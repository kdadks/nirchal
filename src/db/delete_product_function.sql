-- Function to delete a product while handling audit log conflicts
CREATE OR REPLACE FUNCTION delete_product_with_audit_cleanup(product_id UUID)
RETURNS void AS $$
DECLARE
    trigger_exists boolean;
BEGIN
    -- Check if the audit trigger exists
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'product_audit_trigger'
    ) INTO trigger_exists;
    
    -- If trigger exists, temporarily disable it
    IF trigger_exists THEN
        ALTER TABLE products DISABLE TRIGGER product_audit_trigger;
    END IF;
    
    -- Delete audit logs first
    DELETE FROM product_audit_log WHERE product_audit_log.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- Delete the product (cascades to related tables)
    DELETE FROM products WHERE id = delete_product_with_audit_cleanup.product_id;
    
    -- Re-enable the trigger if it was disabled
    IF trigger_exists THEN
        ALTER TABLE products ENABLE TRIGGER product_audit_trigger;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Always re-enable trigger in case of error
    IF trigger_exists THEN
        ALTER TABLE products ENABLE TRIGGER product_audit_trigger;
    END IF;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_product_with_audit_cleanup(UUID) TO authenticated;
