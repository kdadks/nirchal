-- ============================================================================
-- DIAGNOSE PGCRYPTO ISSUE
-- ============================================================================

-- Test 1: Check if extension is enabled
SELECT 
    extname, 
    extversion,
    (SELECT nspname FROM pg_namespace WHERE oid = extnamespace) as schema
FROM pg_extension 
WHERE extname = 'pgcrypto';

-- Test 2: Check if gen_salt function exists
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'gen_salt';

-- Test 3: Check if crypt function exists
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'crypt';

-- Test 4: Try calling gen_salt directly
SELECT gen_salt('bf');

-- Test 5: Try calling crypt directly
SELECT crypt('test123', gen_salt('bf'));

-- Test 6: Check search_path
SHOW search_path;
