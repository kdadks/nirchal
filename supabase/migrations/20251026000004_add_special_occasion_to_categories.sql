-- Add special occasion fields to categories table
-- This allows creating categories for special occasions (Navratri, Diwali, etc.) 
-- that don't appear in regular navigation but can be linked to hero sections

-- Add is_special_occasion column to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_special_occasion BOOLEAN DEFAULT FALSE;

-- Add occasion_slug for URL-friendly reference (can be different from main slug)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_slug VARCHAR(100);

-- Add occasion_start_date and occasion_end_date for time-based display
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_end_date TIMESTAMP WITH TIME ZONE;

-- Add occasion_banner_image for hero section display
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_banner_image TEXT;

-- Add occasion_banner_color for hero section styling
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_banner_color VARCHAR(7) DEFAULT '#ffffff';

-- Add occasion_text_color for hero section styling
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS occasion_text_color VARCHAR(7) DEFAULT '#000000';

-- Add index for quick lookup of special occasion categories
CREATE INDEX IF NOT EXISTS idx_categories_special_occasion 
ON public.categories(is_special_occasion, occasion_slug) 
WHERE is_special_occasion = true;

-- Add index for active special occasions by date
CREATE INDEX IF NOT EXISTS idx_categories_occasion_dates 
ON public.categories(occasion_start_date, occasion_end_date) 
WHERE is_special_occasion = true;

-- Add index for filtering out special occasions from regular navigation
CREATE INDEX IF NOT EXISTS idx_categories_regular_active 
ON public.categories(is_active, is_special_occasion) 
WHERE is_active = true AND is_special_occasion = false;

-- Comment on columns
COMMENT ON COLUMN public.categories.is_special_occasion IS 'True if this category is for a special occasion and should not appear in regular navigation';
COMMENT ON COLUMN public.categories.occasion_slug IS 'URL-friendly slug for the special occasion (e.g., navratri-2024, diwali-2024)';
COMMENT ON COLUMN public.categories.occasion_start_date IS 'Start date for displaying this special occasion category';
COMMENT ON COLUMN public.categories.occasion_end_date IS 'End date for displaying this special occasion category';
COMMENT ON COLUMN public.categories.occasion_banner_image IS 'Banner image URL for hero section display';
COMMENT ON COLUMN public.categories.occasion_banner_color IS 'Background color for hero section banner';
COMMENT ON COLUMN public.categories.occasion_text_color IS 'Text color for hero section banner';
