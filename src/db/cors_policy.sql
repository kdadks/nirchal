-- Enable CORS for our local development URL
INSERT INTO storage.buckets (id, name)
VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

ALTER POLICY "Enable read access for all users"
ON storage.objects
USING (bucket_id = 'avatars' AND auth.role() = 'anon');

-- Add a policy to enable anonymous select
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_policies 
      WHERE tablename = 'faqs' 
      AND policyname = 'Enable anonymous select'
   ) THEN
      CREATE POLICY "Enable anonymous select" 
      ON faqs
      FOR SELECT 
      TO anon
      USING (true);
   END IF;
END
$do$;

-- Update RLS to be more permissive for testing
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS "Allow public read access to faqs" ON faqs;
DROP POLICY IF EXISTS "Allow anonymous read access to faqs" ON faqs;

-- Create a new simple policy
CREATE POLICY "Allow public read access to faqs"
ON faqs
AS PERMISSIVE
FOR ALL
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'faqs';
