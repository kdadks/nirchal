-- Set up RLS policy
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Enable anonymous select" ON faqs;
DROP POLICY IF EXISTS "Enable access to all users" ON faqs;

-- Create very permissive policy for testing
CREATE POLICY "Enable access to all users"
ON faqs
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Verify policy is created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'faqs';

-- Test access
SELECT COUNT(*) as total_faqs FROM faqs;
