-- Create logistics_partners table
CREATE TABLE IF NOT EXISTS logistics_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address TEXT,
  tracking_url_template VARCHAR(500), -- Template URL for tracking with {tracking_number} placeholder
  contact_person VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_logistics_partners_updated_at 
    BEFORE UPDATE ON logistics_partners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE logistics_partners ENABLE ROW LEVEL SECURITY;

-- Allow admin users to manage logistics partners
CREATE POLICY "Admin can manage logistics partners" ON logistics_partners
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Allow authenticated users to read active logistics partners
CREATE POLICY "Users can read active logistics partners" ON logistics_partners
  FOR SELECT USING (is_active = true);

-- Add indexes for performance
CREATE INDEX idx_logistics_partners_active ON logistics_partners(is_active);
CREATE INDEX idx_logistics_partners_name ON logistics_partners(name);

-- Insert some default logistics partners
INSERT INTO logistics_partners (name, description, email, phone, website, tracking_url_template, contact_person, is_active) VALUES
('Blue Dart', 'Express logistics and courier services', 'support@bluedart.com', '1800-123-4567', 'https://www.bluedart.com', 'https://www.bluedart.com/tracking?awb={tracking_number}', 'Customer Service', true),
('DTDC', 'Domestic and international courier services', 'support@dtdc.in', '1800-103-3354', 'https://www.dtdc.in', 'https://www.dtdc.in/tracking/packagetrack?trackingId={tracking_number}', 'Tracking Team', true),
('Delhivery', 'E-commerce logistics and supply chain services', 'care@delhivery.com', '124-456-0000', 'https://www.delhivery.com', 'https://www.delhivery.com/track?packageId={tracking_number}', 'Support Team', true),
('Ecom Express', 'E-commerce focused logistics solutions', 'support@ecomexpress.in', '1800-3000-3364', 'https://ecomexpress.in', 'https://ecomexpress.in/tracking/?awb_field={tracking_number}', 'Customer Care', true);

-- Add logistics partner fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS logistics_partner_id UUID REFERENCES logistics_partners(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- Add index for logistics partner lookups
CREATE INDEX IF NOT EXISTS idx_orders_logistics_partner ON orders(logistics_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
