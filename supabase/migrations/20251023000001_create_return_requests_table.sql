-- Create return_requests table for managing product returns and refunds
-- Migration: 20251023000001

-- Create return_requests table
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  customer_id UUID NOT NULL, -- References auth.users(id)
  
  -- Request Details
  return_number VARCHAR(50) UNIQUE NOT NULL,
  request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('return_refund', 'return_exchange')),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('defective', 'wrong_item', 'size_issue', 'not_as_described', 'quality_issue', 'color_mismatch', 'other')),
  reason_details TEXT NOT NULL,
  
  -- Status Tracking
  status VARCHAR(30) NOT NULL DEFAULT 'pending_shipment' CHECK (status IN (
    'pending_shipment',
    'shipped_by_customer',
    'received',
    'under_inspection',
    'approved',
    'partially_approved',
    'rejected',
    'refund_initiated',
    'refund_completed'
  )),
  
  -- Customer Shipping
  customer_shipped_date TIMESTAMP,
  customer_tracking_number VARCHAR(100),
  customer_courier_name VARCHAR(50),
  
  -- Warehouse Receipt
  received_date TIMESTAMP,
  received_by UUID, -- References auth.users(id)
  received_notes TEXT,
  
  -- Inspection (Done before approval/rejection)
  inspection_date TIMESTAMP,
  inspection_status VARCHAR(20) CHECK (inspection_status IN ('passed', 'failed', 'partial_pass')),
  inspection_notes TEXT,
  inspected_by UUID, -- References auth.users(id)
  
  -- Approval/Rejection (After inspection)
  decision_date TIMESTAMP,
  decision_by UUID, -- References auth.users(id)
  decision_notes TEXT,
  rejection_reason TEXT,
  
  -- Deductions (Calculated during inspection)
  deduction_amount DECIMAL(10, 2) DEFAULT 0,
  deduction_breakdown JSONB,
  
  -- Financial
  original_order_amount DECIMAL(10, 2) NOT NULL,
  calculated_refund_amount DECIMAL(10, 2),
  final_refund_amount DECIMAL(10, 2),
  
  -- Razorpay Refund
  razorpay_payment_id VARCHAR(100),
  razorpay_refund_id VARCHAR(100),
  razorpay_refund_status VARCHAR(20),
  refund_initiated_date TIMESTAMP,
  refund_completed_date TIMESTAMP,
  refund_failure_reason TEXT,
  
  -- Exchange Details
  exchange_order_id UUID REFERENCES orders(id),
  exchange_initiated_date TIMESTAMP,
  
  -- Evidence
  customer_images TEXT[] NOT NULL,
  customer_video_url TEXT,
  inspection_images TEXT[],
  inspection_video_url TEXT,
  
  -- Return Address Used
  return_address_line1 VARCHAR(255) NOT NULL,
  return_address_line2 VARCHAR(255),
  return_address_city VARCHAR(100) NOT NULL,
  return_address_state VARCHAR(100) NOT NULL,
  return_address_postal_code VARCHAR(20) NOT NULL,
  return_address_country VARCHAR(100) NOT NULL DEFAULT 'India',
  return_address_phone VARCHAR(20),
  
  -- Metadata
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_customer_images CHECK (array_length(customer_images, 1) >= 2),
  CONSTRAINT valid_refund_amounts CHECK (
    (calculated_refund_amount IS NULL OR calculated_refund_amount >= 0) AND
    (final_refund_amount IS NULL OR final_refund_amount >= 0) AND
    (deduction_amount >= 0)
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX idx_return_requests_customer_id ON return_requests(customer_id);
CREATE INDEX idx_return_requests_status ON return_requests(status);
CREATE INDEX idx_return_requests_return_number ON return_requests(return_number);
CREATE INDEX idx_return_requests_inspection_date ON return_requests(inspection_date);
CREATE INDEX idx_return_requests_created_at ON return_requests(created_at DESC);
CREATE INDEX idx_return_requests_razorpay_payment_id ON return_requests(razorpay_payment_id);
CREATE INDEX idx_return_requests_razorpay_refund_id ON return_requests(razorpay_refund_id);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_return_requests_updated_at
  BEFORE UPDATE ON return_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_return_requests_updated_at();

-- Create function to generate return number
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year_part TEXT;
  return_num TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(return_number FROM 'RET/\d{4}/(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM return_requests
  WHERE return_number LIKE 'RET/' || year_part || '/%';
  
  -- Format as RET/YYYY/0001
  return_num := 'RET/' || year_part || '/' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN return_num;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE return_requests IS 'Stores product return and refund requests from customers';
COMMENT ON COLUMN return_requests.return_number IS 'Unique return number in format RET/YYYY/0001';
COMMENT ON COLUMN return_requests.status IS 'Current status of the return request workflow';
COMMENT ON COLUMN return_requests.request_type IS 'Type of request: return for refund or exchange';
COMMENT ON COLUMN return_requests.inspection_status IS 'Result of product inspection: passed, failed, or partial_pass';
COMMENT ON COLUMN return_requests.deduction_breakdown IS 'JSON object containing itemized deduction details';
COMMENT ON COLUMN return_requests.customer_images IS 'Array of image URLs uploaded by customer (minimum 2 required)';
COMMENT ON COLUMN return_requests.inspection_images IS 'Array of image URLs uploaded during inspection';
