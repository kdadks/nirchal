-- Create razorpay_refund_transactions table for tracking Razorpay refunds
-- Migration: 20251023000004

CREATE TABLE IF NOT EXISTS razorpay_refund_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  
  -- Transaction Details
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL CHECK (refund_amount >= 0),
  
  -- Razorpay Details
  razorpay_payment_id VARCHAR(100) NOT NULL,
  razorpay_refund_id VARCHAR(100),
  razorpay_order_id VARCHAR(100),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- API call not yet made
    'initiated',    -- API call made, waiting for confirmation
    'processed',    -- Razorpay confirmed refund
    'failed'        -- API call failed
  )),
  
  -- API Response
  razorpay_response JSONB,
  razorpay_speed VARCHAR(20) CHECK (razorpay_speed IN ('normal', 'optimum')),
  razorpay_status VARCHAR(20),
  
  -- Timeline
  initiated_at TIMESTAMP,
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  failure_reason TEXT,
  
  -- Admin
  initiated_by UUID, -- References auth.users(id)
  
  -- Breakdown
  original_amount DECIMAL(10, 2) NOT NULL CHECK (original_amount >= 0),
  deduction_amount DECIMAL(10, 2) DEFAULT 0 CHECK (deduction_amount >= 0),
  deduction_details JSONB,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_refund_calculation CHECK (refund_amount = original_amount - deduction_amount)
);

-- Create indexes for better query performance
CREATE INDEX idx_razorpay_refunds_return_id ON razorpay_refund_transactions(return_request_id);
CREATE INDEX idx_razorpay_refunds_order_id ON razorpay_refund_transactions(order_id);
CREATE INDEX idx_razorpay_refunds_status ON razorpay_refund_transactions(status);
CREATE INDEX idx_razorpay_refunds_razorpay_payment_id ON razorpay_refund_transactions(razorpay_payment_id);
CREATE INDEX idx_razorpay_refunds_razorpay_refund_id ON razorpay_refund_transactions(razorpay_refund_id);
CREATE INDEX idx_razorpay_refunds_transaction_number ON razorpay_refund_transactions(transaction_number);
CREATE INDEX idx_razorpay_refunds_created_at ON razorpay_refund_transactions(created_at DESC);

-- Create function to generate refund transaction number
CREATE OR REPLACE FUNCTION generate_refund_transaction_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year_part TEXT;
  trans_num TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 'REFD/\d{4}/(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM razorpay_refund_transactions
  WHERE transaction_number LIKE 'REFD/' || year_part || '/%';
  
  -- Format as REFD/YYYY/0001
  trans_num := 'REFD/' || year_part || '/' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN trans_num;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE razorpay_refund_transactions IS 'Tracks Razorpay refund API calls and responses for return requests';
COMMENT ON COLUMN razorpay_refund_transactions.transaction_number IS 'Unique refund transaction number in format REFD/YYYY/0001';
COMMENT ON COLUMN razorpay_refund_transactions.status IS 'Refund processing status: pending, initiated, processed, or failed';
COMMENT ON COLUMN razorpay_refund_transactions.razorpay_speed IS 'Refund speed requested: normal (5-7 days) or optimum (instant)';
COMMENT ON COLUMN razorpay_refund_transactions.razorpay_response IS 'Full JSON response from Razorpay API';
COMMENT ON COLUMN razorpay_refund_transactions.deduction_details IS 'JSON object with itemized deduction breakdown';
