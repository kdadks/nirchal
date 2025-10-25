-- Create return_status_history table for audit trail of status changes
-- Migration: 20251023000003

CREATE TABLE IF NOT EXISTS return_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Status Change
  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  
  -- Who Made the Change
  changed_by UUID, -- References auth.users(id)
  changed_by_role VARCHAR(20) CHECK (changed_by_role IN ('customer', 'admin', 'system')),
  
  -- Additional Context
  notes TEXT,
  metadata JSONB, -- Store additional context like deduction details, images, etc.
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_return_status_history_return_id ON return_status_history(return_request_id);
CREATE INDEX idx_return_status_history_created_at ON return_status_history(created_at DESC);
CREATE INDEX idx_return_status_history_to_status ON return_status_history(to_status);

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_return_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO return_status_history (
      return_request_id,
      from_status,
      to_status,
      changed_by,
      changed_by_role,
      metadata
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(NEW.decision_by, NEW.inspected_by, NEW.received_by, auth.uid()),
      CASE
        WHEN auth.uid() IN (
          SELECT id FROM auth.users 
          WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        ) THEN 'admin'
        WHEN auth.uid() = NEW.customer_id THEN 'customer'
        ELSE 'system'
      END,
      jsonb_build_object(
        'inspection_status', NEW.inspection_status,
        'deduction_amount', NEW.deduction_amount,
        'calculated_refund', NEW.calculated_refund_amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes
CREATE TRIGGER trigger_log_return_status_change
  AFTER INSERT OR UPDATE ON return_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_return_status_change();

-- Add comments for documentation
COMMENT ON TABLE return_status_history IS 'Audit trail of all status changes for return requests';
COMMENT ON COLUMN return_status_history.changed_by_role IS 'Role of the person/system that made the change: customer, admin, or system';
COMMENT ON COLUMN return_status_history.metadata IS 'Additional context data stored as JSON (deductions, amounts, etc.)';
