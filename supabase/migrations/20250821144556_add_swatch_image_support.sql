-- Add swatch image support to product variants
-- This allows variants to reference existing product images as swatches

-- Add swatch_image_id column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN swatch_image_id UUID REFERENCES product_images(id) ON DELETE SET NULL;

-- Add index for better performance when querying by swatch
CREATE INDEX idx_product_variants_swatch_image ON product_variants(swatch_image_id);

-- Add comment for documentation
COMMENT ON COLUMN product_variants.swatch_image_id IS 'References an existing product image to use as color/material swatch';
