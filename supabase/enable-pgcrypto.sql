-- ============================================================================
-- EMERGENCY FIX: Enable pgcrypto extension
-- Run this FIRST before running the main migration
-- ============================================================================

-- Enable pgcrypto extension (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extension is enabled
SELECT 
    'Extension Check' as verification_type,
    extname,
    extversion
FROM pg_extension
WHERE extname = 'pgcrypto';
