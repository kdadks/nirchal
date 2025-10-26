-- Add show_view_all_button field to featured_sections table
-- This allows hiding the "View All Products" button for specific sections

ALTER TABLE featured_sections 
ADD COLUMN IF NOT EXISTS show_view_all_button BOOLEAN DEFAULT TRUE;

-- Comment on column
COMMENT ON COLUMN featured_sections.show_view_all_button IS 'Whether to display the "View All Products" button below this section';
