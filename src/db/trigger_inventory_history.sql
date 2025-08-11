-- Trigger function to log inventory changes to inventory_history
CREATE OR REPLACE FUNCTION log_inventory_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if quantity actually changes
  IF NEW.quantity IS DISTINCT FROM OLD.quantity THEN
    INSERT INTO inventory_history (
      inventory_id,
      previous_quantity,
      new_quantity,
      change_type,
      reason,
      created_by,
      created_at
    ) VALUES (
      NEW.id,
      OLD.quantity,
      NEW.quantity,
      CASE WHEN NEW.quantity > OLD.quantity THEN 'STOCK_IN' ELSE 'STOCK_OUT' END,
      'Automatic log (trigger)',
      NULL,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trg_log_inventory_history ON inventory;

-- Create trigger on inventory table for updates
CREATE TRIGGER trg_log_inventory_history
AFTER UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION log_inventory_history();
