-- CRITICAL PERFORMANCE FIXES
-- Adds missing indexes for foreign keys and primary key

-- =============================================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES (High Priority)
-- =============================================================================

-- Categories: parent_id for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id 
ON public.categories(parent_id);

-- Inventory: product_id and variant_id for lookups
CREATE INDEX IF NOT EXISTS idx_inventory_product_id 
ON public.inventory(product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_variant_id 
ON public.inventory(variant_id);

-- Inventory history: inventory_id for tracking
CREATE INDEX IF NOT EXISTS idx_inventory_history_inventory_id 
ON public.inventory_history(inventory_id);

-- Order status history: order_id for lookups
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id 
ON public.order_status_history(order_id);

-- Product audit log: product_id for filtering
CREATE INDEX IF NOT EXISTS idx_product_audit_log_product_id 
ON public.product_audit_log(product_id);

-- Products: category_id for filtering by category
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON public.products(category_id);

-- Return items: exchange_product_id for exchange processing
CREATE INDEX IF NOT EXISTS idx_return_items_exchange_product_id 
ON public.return_items(exchange_product_id);

-- Return requests: exchange_order_id for exchange tracking
CREATE INDEX IF NOT EXISTS idx_return_requests_exchange_order_id 
ON public.return_requests(exchange_order_id);

-- =============================================================================
-- PART 2: ADD MISSING PRIMARY KEY (Critical)
-- =============================================================================

-- Add primary key to order_status_history
-- Using id column if it exists, or create composite key
DO $$
BEGIN
    -- Check if id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_status_history' 
        AND column_name = 'id'
    ) THEN
        -- Add primary key on id if it doesn't have one
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'order_status_history' 
            AND constraint_type = 'PRIMARY KEY'
        ) THEN
            ALTER TABLE public.order_status_history 
            ADD PRIMARY KEY (id);
            RAISE NOTICE 'Added primary key on order_status_history.id';
        END IF;
    ELSE
        RAISE NOTICE 'order_status_history needs manual review - no id column found';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adding primary key to order_status_history: %', SQLERRM;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check all foreign key indexes are in place
SELECT 
    'FOREIGN KEY INDEXES' as check_type,
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_categories_parent_id',
    'idx_inventory_product_id',
    'idx_inventory_variant_id',
    'idx_inventory_history_inventory_id',
    'idx_order_status_history_order_id',
    'idx_product_audit_log_product_id',
    'idx_products_category_id',
    'idx_return_items_exchange_product_id',
    'idx_return_requests_exchange_order_id'
)
ORDER BY tablename, indexname;

-- Check primary key on order_status_history
SELECT 
    'PRIMARY KEYS' as check_type,
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'order_status_history'
AND constraint_type = 'PRIMARY KEY';

-- Summary
DO $$
DECLARE
    fk_indexes_created integer;
    has_primary_key boolean;
BEGIN
    SELECT COUNT(*) INTO fk_indexes_created
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname IN (
        'idx_categories_parent_id',
        'idx_inventory_product_id',
        'idx_inventory_variant_id',
        'idx_inventory_history_inventory_id',
        'idx_order_status_history_order_id',
        'idx_product_audit_log_product_id',
        'idx_products_category_id',
        'idx_return_items_exchange_product_id',
        'idx_return_requests_exchange_order_id'
    );
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'order_status_history' 
        AND constraint_type = 'PRIMARY KEY'
    ) INTO has_primary_key;
    
    RAISE NOTICE '================================================';
    RAISE NOTICE 'CRITICAL PERFORMANCE FIXES APPLIED';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Foreign key indexes created: %/9', fk_indexes_created;
    RAISE NOTICE 'order_status_history primary key: %', CASE WHEN has_primary_key THEN 'EXISTS' ELSE 'MISSING - NEEDS MANUAL FIX' END;
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Impact: Improved JOIN performance, better query planning';
    RAISE NOTICE '================================================';
END $$;