-- Enable RLS on faqs table
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access to faqs
CREATE POLICY "Allow anonymous read access to faqs"
ON faqs
FOR SELECT
TO anon
USING (true);

-- Create policy to allow authenticated users to manage faqs
CREATE POLICY "Allow authenticated users to manage faqs"
ON faqs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
