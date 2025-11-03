-- ============================================================================
-- EMERGENCY FIX - RUN THIS NOW
-- ============================================================================

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify it's enabled
SELECT extname, extversion FROM pg_extension WHERE extname = 'pgcrypto';

-- Test gen_salt function
SELECT gen_salt('bf') as test_salt;
