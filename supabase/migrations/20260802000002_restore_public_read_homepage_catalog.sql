-- =====================================================================================
-- Fix: Restore public read access for homepage and catalog tables
-- =====================================================================================
-- The admin_authenticated_rls migration removed public read policies from several
-- tables that the public-facing homepage and product catalog depend on. This breaks:
--   - Hero carousel images (hero_slides)
--   - Featured sections on homepage (featured_sections, featured_section_products)
--   - Product stock status display (inventory)
--   - Product reviews display (product_reviews)
--
-- This migration adds back public SELECT policies for anonymous users on those tables.

-- ============================================================================
-- HERO_SLIDES
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'hero_slides' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.hero_slides CASCADE';
  END LOOP;
END $$;

CREATE POLICY "service_role_all_access_hero_slides"
  ON public.hero_slides
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_admin_hero_slides"
  ON public.hero_slides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_hero_slides"
  ON public.hero_slides
  FOR SELECT
  USING (true);

-- ============================================================================
-- FEATURED_SECTIONS
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'featured_sections' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.featured_sections CASCADE';
  END LOOP;
END $$;

CREATE POLICY "service_role_all_access_featured_sections"
  ON public.featured_sections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_admin_featured_sections"
  ON public.featured_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_featured_sections"
  ON public.featured_sections
  FOR SELECT
  USING (true);

-- ============================================================================
-- FEATURED_SECTION_PRODUCTS
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'featured_section_products' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.featured_section_products CASCADE';
  END LOOP;
END $$;

CREATE POLICY "service_role_all_access_featured_products"
  ON public.featured_section_products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_admin_featured_products"
  ON public.featured_section_products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_featured_products"
  ON public.featured_section_products
  FOR SELECT
  USING (true);

-- ============================================================================
-- INVENTORY
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'inventory' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.inventory CASCADE';
  END LOOP;
END $$;

CREATE POLICY "service_role_all_access_inventory"
  ON public.inventory
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_admin_inventory"
  ON public.inventory
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_inventory"
  ON public.inventory
  FOR SELECT
  USING (true);

-- ============================================================================
-- PRODUCT_REVIEWS
-- ============================================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'product_reviews' AND schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.product_reviews CASCADE';
  END LOOP;
END $$;

CREATE POLICY "service_role_all_access_reviews"
  ON public.product_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_admin_reviews"
  ON public.product_reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_reviews"
  ON public.product_reviews
  FOR SELECT
  USING (true);

-- ============================================================================
-- ENSURE RLS REMAINS ENABLED
-- ============================================================================
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_section_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
