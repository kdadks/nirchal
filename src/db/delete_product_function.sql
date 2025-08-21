-- Function to delete a product while handling audit log conflicts and inventory history
CREATE OR REPLACE FUNCTION delete_product_with_audit_cleanup(product_id UUID)
RETURNS void AS $$
DECLARE
    audit_trigger_exists boolean;
    inventory_trigger_exists boolean;
    inventory_ids integer[];
BEGIN
    -- Check if triggers exist
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'product_audit_trigger'
    ) INTO audit_trigger_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_log_inventory_history'
    ) INTO inventory_trigger_exists;
    
    -- Disable triggers temporarily
    IF audit_trigger_exists THEN
        ALTER TABLE products DISABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN
        ALTER TABLE inventory DISABLE TRIGGER trg_log_inventory_history;
    END IF;
    
    -- Get all inventory IDs for this product (including variants) - NOTE: inventory.id is integer, not UUID
    SELECT ARRAY(
        SELECT id FROM inventory WHERE inventory.product_id = delete_product_with_audit_cleanup.product_id
    ) INTO inventory_ids;
    
    -- Delete in the correct order to avoid foreign key conflicts
    
    -- 1. Delete inventory history for all inventory records (bypass RLS with SECURITY DEFINER)
    IF array_length(inventory_ids, 1) > 0 THEN
        DELETE FROM inventory_history WHERE inventory_id = ANY(inventory_ids);
    END IF;
    
    -- 2. Delete audit logs
    DELETE FROM product_audit_log WHERE product_audit_log.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 3. Delete inventory records
    DELETE FROM inventory WHERE inventory.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 4. Delete product variants (cascades to their related data)
    DELETE FROM product_variants WHERE product_variants.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 5. Delete product images
    DELETE FROM product_images WHERE product_images.product_id = delete_product_with_audit_cleanup.product_id;
    
    -- 6. Finally delete the product
    DELETE FROM products WHERE id = delete_product_with_audit_cleanup.product_id;
    
    -- Re-enable triggers
    IF audit_trigger_exists THEN
        ALTER TABLE products ENABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN
        ALTER TABLE inventory ENABLE TRIGGER trg_log_inventory_history;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    -- Always re-enable triggers in case of error
    IF audit_trigger_exists THEN
        ALTER TABLE products ENABLE TRIGGER product_audit_trigger;
    END IF;
    
    IF inventory_trigger_exists THEN
        ALTER TABLE inventory ENABLE TRIGGER trg_log_inventory_history;
    END IF;
    
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_product_with_audit_cleanup(UUID) TO authenticated;

-- Helper function to clean inventory history for a specific product
CREATE OR REPLACE FUNCTION clean_inventory_history_for_product(product_id UUID)
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- Delete all inventory history records for inventory that belongs to this product
    DELETE FROM inventory_history 
    WHERE inventory_id IN (
        SELECT id FROM inventory WHERE inventory.product_id = clean_inventory_history_for_product.product_id
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION clean_inventory_history_for_product(UUID) TO authenticated;
