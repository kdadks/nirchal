-- Fix settings table unique constraint for upsert operations
-- Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- Drop the constraint if it exists (in case it's corrupted)
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_category_key_key;

-- Re-create the unique constraint on (category, key)
ALTER TABLE settings 
ADD CONSTRAINT settings_category_key_key UNIQUE (category, key);

-- Verify the constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'settings_category_key_key' 
    AND conrelid = 'settings'::regclass
  ) THEN
    RAISE EXCEPTION 'Failed to create unique constraint on settings(category, key)';
  END IF;
END $$;

-- Add comment
COMMENT ON CONSTRAINT settings_category_key_key ON settings IS 'Ensures each setting key is unique within its category, required for upsert operations';
