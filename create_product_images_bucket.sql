-- Create product-images storage bucket if it doesn't exist
-- Run this in your Supabase SQL editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload product images
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to product images
CREATE POLICY "Allow public read access to product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Create policy to allow authenticated users to update product images
CREATE POLICY "Allow authenticated users to update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete product images
CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'product-images';
