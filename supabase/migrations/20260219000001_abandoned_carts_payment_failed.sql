-- Add 'payment_failed' status support and notes column to abandoned_carts
-- This allows recording orders where payment was attempted but failed

-- Add notes column to store failure reason and order number
ALTER TABLE abandoned_carts
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop existing check constraint on status if it exists, then recreate with new value
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'abandoned_carts'
      AND constraint_name = 'abandoned_carts_status_check'
  ) THEN
    ALTER TABLE abandoned_carts DROP CONSTRAINT abandoned_carts_status_check;
  END IF;

  -- Add updated constraint that includes payment_failed
  ALTER TABLE abandoned_carts
    ADD CONSTRAINT abandoned_carts_status_check
    CHECK (status IN ('abandoned', 'recovered', 'expired', 'contacted', 'payment_failed'));
END $$;

-- Index for quick filtering by payment_failed status
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_payment_failed
  ON abandoned_carts (status)
  WHERE status = 'payment_failed';
