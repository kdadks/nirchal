-- First disable RLS to make sure we can modify policies
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Allow public read access to faqs" ON faqs;
DROP POLICY IF EXISTS "Allow anonymous read access to faqs" ON faqs;
DROP POLICY IF EXISTS "Enable anonymous select" ON faqs;

-- Create a simple policy for anonymous access
CREATE POLICY "Enable anonymous select" 
ON faqs
FOR SELECT 
TO anon
USING (true);

-- Re-enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Verify the data is accessible
SELECT COUNT(*) FROM faqs;

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'faqs';
