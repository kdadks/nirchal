-- Fix RLS policies for product_variants to ensure public access
-- This should allow the colors to be fetched properly

-- First, disable RLS temporarily
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;
DROP POLICY IF EXISTS "Enable read access for all users" ON product_variants;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON product_variants;

-- Create a comprehensive public read policy
CREATE POLICY "Allow public read access to product variants" 
ON product_variants 
FOR SELECT 
TO public 
USING (true);

-- Grant permissions to anonymous users
GRANT SELECT ON product_variants TO anon;
GRANT SELECT ON product_variants TO authenticated;

-- Re-enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Test the policy by selecting some data
SELECT 
    pv.id,
    pv.product_id,
    pv.color,
    pv.size,
    p.name as product_name
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.product_id IN (25, 26, 27)
ORDER BY pv.product_id;
