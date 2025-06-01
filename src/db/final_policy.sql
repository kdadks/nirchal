-- Disable RLS temporarily
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;

-- Clear any existing policies
DROP POLICY IF EXISTS "faqs_policy" ON faqs;

-- Create a simple policy that allows everything (for testing)
CREATE POLICY "faqs_policy" ON faqs USING (true);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Grant access to all roles
GRANT ALL ON faqs TO PUBLIC;
GRANT ALL ON faqs TO anon;
GRANT ALL ON faqs TO authenticated;

-- Verify access by selecting data
SELECT * FROM faqs LIMIT 1;
