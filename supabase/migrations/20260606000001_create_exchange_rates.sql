-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL UNIQUE,
  rate NUMERIC(10, 2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rates
INSERT INTO public.exchange_rates (currency, rate, source) VALUES
  ('USD', 88.00, 'manual'),
  ('EUR', 102.00, 'manual')
ON CONFLICT (currency) DO NOTHING;

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exchange rates
CREATE POLICY "Anyone can read exchange rates"
  ON public.exchange_rates
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated admins can update
CREATE POLICY "Only admins can update exchange rates"
  ON public.exchange_rates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated admins can insert
CREATE POLICY "Only admins can insert exchange rates"
  ON public.exchange_rates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to get current exchange rates
CREATE OR REPLACE FUNCTION public.get_exchange_rates()
RETURNS TABLE (
  currency VARCHAR(3),
  rate NUMERIC(10, 2),
  updated_at TIMESTAMPTZ,
  source VARCHAR(50)
) LANGUAGE sql STABLE AS $$
  SELECT currency, rate, updated_at, source
  FROM public.exchange_rates
  ORDER BY currency;
$$;

-- Create function to update exchange rate (with audit trail)
CREATE OR REPLACE FUNCTION public.update_exchange_rate(
  p_currency VARCHAR(3),
  p_rate NUMERIC(10, 2),
  p_source VARCHAR(50) DEFAULT 'manual'
)
RETURNS TABLE (
  currency VARCHAR(3),
  rate NUMERIC(10, 2),
  updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update the exchange rate
  UPDATE public.exchange_rates
  SET 
    rate = p_rate,
    updated_at = NOW(),
    updated_by = auth.uid(),
    source = p_source
  WHERE exchange_rates.currency = p_currency;

  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO public.exchange_rates (currency, rate, updated_by, source)
    VALUES (p_currency, p_rate, auth.uid(), p_source);
  END IF;

  -- Return the updated rate
  RETURN QUERY
    SELECT er.currency, er.rate, er.updated_at
    FROM public.exchange_rates er
    WHERE er.currency = p_currency;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_exchange_rates() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_exchange_rate(VARCHAR, NUMERIC, VARCHAR) TO authenticated;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency ON public.exchange_rates(currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON public.exchange_rates(updated_at DESC);
