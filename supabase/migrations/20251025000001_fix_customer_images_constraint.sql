-- Fix customer_images constraint to allow 0 or more images (not mandatory)
-- Migration: 20251025000001

-- Drop the old constraint
ALTER TABLE return_requests DROP CONSTRAINT IF EXISTS valid_customer_images;

-- Add new constraint that allows empty array or at least 1 image
ALTER TABLE return_requests ADD CONSTRAINT valid_customer_images 
  CHECK (
    customer_images IS NULL OR 
    array_length(customer_images, 1) IS NULL OR 
    array_length(customer_images, 1) >= 1
  );
