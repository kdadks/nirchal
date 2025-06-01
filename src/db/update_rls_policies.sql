-- First drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read access to faqs" ON faqs;
DROP POLICY IF EXISTS "Allow authenticated users to manage faqs" ON faqs;

-- Disable RLS temporarily to verify data
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- Verify data exists
SELECT * FROM faqs;

-- Re-enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create a simpler read-only policy for everyone
CREATE POLICY "Allow public read access to faqs"
ON faqs
FOR SELECT
USING (true);

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'faqs';
