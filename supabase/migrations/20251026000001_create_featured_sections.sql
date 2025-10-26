-- Create featured sections system for homepage
-- Migration: 20251026000001

-- Table to store featured sections (like "Trending Now", "Best Sellers", etc.)
CREATE TABLE IF NOT EXISTS featured_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  section_type VARCHAR(50) DEFAULT 'custom' CHECK (section_type IN ('custom', 'trending', 'new_arrivals', 'best_sellers')),
  max_products INTEGER DEFAULT 8 CHECK (max_products > 0 AND max_products <= 20),
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#000000',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID -- References auth.users(id)
);

-- Table to store products in each section
CREATE TABLE IF NOT EXISTS featured_section_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES featured_sections(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section_id, product_id) -- Each product can only appear once per section
);

-- Indexes for performance
CREATE INDEX idx_featured_sections_active ON featured_sections(is_active, display_order);
CREATE INDEX idx_featured_sections_slug ON featured_sections(slug);
CREATE INDEX idx_featured_section_products_section ON featured_section_products(section_id, display_order);
CREATE INDEX idx_featured_section_products_product ON featured_section_products(product_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_featured_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_featured_sections_updated_at
  BEFORE UPDATE ON featured_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_sections_updated_at();

-- Enable RLS
ALTER TABLE featured_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_section_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations (since we'll use service role for admin operations)
CREATE POLICY "Allow all featured sections operations" ON featured_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all featured section products operations" ON featured_section_products FOR ALL USING (true) WITH CHECK (true);

-- Insert default sections (ordered by priority: New Arrivals, Trending Now, Featured Products)
INSERT INTO featured_sections (title, description, slug, display_order, is_active, section_type, max_products, background_color, text_color)
VALUES 
  ('New Arrivals', 'Check out our latest products', 'new-arrivals', 0, true, 'new_arrivals', 5, '#ffffff', '#000000'),
  ('Trending Now', 'Discover what''s popular this season', 'trending-now', 1, true, 'trending', 5, '#ffffff', '#000000'),
  ('Featured Products', 'Our hand-picked selection of premium products', 'featured-products', 2, true, 'custom', 5, '#f8f9fa', '#1a1a1a')
ON CONFLICT (slug) DO NOTHING;

-- Migrate existing is_featured products to "Featured Products" section
-- First, get or create the Featured Products section
DO $$
DECLARE
  featured_section_id UUID;
BEGIN
  -- Get the Featured Products section ID
  SELECT id INTO featured_section_id 
  FROM featured_sections 
  WHERE slug = 'featured-products' 
  LIMIT 1;
  
  -- Only proceed if section exists and products table has is_featured column
  IF featured_section_id IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'is_featured'
  ) THEN
    -- Insert all currently featured products into the Featured Products section
    INSERT INTO featured_section_products (section_id, product_id, display_order)
    SELECT 
      featured_section_id,
      id,
      ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 -- 0-indexed ordering
    FROM products
    WHERE is_featured = true
    ON CONFLICT (section_id, product_id) DO NOTHING;
    
    RAISE NOTICE 'Migrated % featured products to Featured Products section', 
      (SELECT COUNT(*) FROM products WHERE is_featured = true);
  END IF;
END $$;

-- Drop the is_featured column from products table (now handled by featured_sections system)
-- First drop any dependent views
DO $$
BEGIN
  -- Drop the top_products_view if it exists (depends on is_featured column)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.views 
    WHERE table_name = 'top_products_view'
  ) THEN
    DROP VIEW IF EXISTS top_products_view CASCADE;
    RAISE NOTICE 'Dropped top_products_view';
  END IF;
END $$;

-- Now drop the is_featured column
-- Check if column exists before dropping
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products DROP COLUMN is_featured;
    RAISE NOTICE 'Dropped is_featured column from products table';
  ELSE
    RAISE NOTICE 'is_featured column does not exist, skipping drop';
  END IF;
END $$;

-- Comments
COMMENT ON TABLE featured_sections IS 'Stores dynamic homepage sections that can be managed from admin panel';
COMMENT ON TABLE featured_section_products IS 'Junction table linking products to featured sections with custom ordering';
COMMENT ON COLUMN featured_sections.section_type IS 'Type of section: custom (manually selected), trending (auto), new_arrivals (auto), best_sellers (auto)';
COMMENT ON COLUMN featured_sections.max_products IS 'Maximum number of products to display in this section';
COMMENT ON COLUMN featured_sections.display_order IS 'Order in which sections appear on homepage (lower = higher on page)';
