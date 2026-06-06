-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a function to fetch and update exchange rates
CREATE OR REPLACE FUNCTION public.fetch_and_update_exchange_rates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usd_rate NUMERIC;
  eur_rate NUMERIC;
  api_response JSONB;
BEGIN
  -- Try primary API: exchangerate-api.com
  BEGIN
    SELECT content::jsonb INTO api_response
    FROM http_get('https://api.exchangerate-api.com/v4/latest/INR');
    
    IF api_response IS NOT NULL AND 
       api_response->'rates' IS NOT NULL AND
       api_response->'rates'->>'USD' IS NOT NULL AND
       api_response->'rates'->>'EUR' IS NOT NULL THEN
      
      -- Calculate INR per USD and EUR
      usd_rate := ROUND((1.0 / (api_response->'rates'->>'USD')::NUMERIC)::NUMERIC, 2);
      eur_rate := ROUND((1.0 / (api_response->'rates'->>'EUR')::NUMERIC)::NUMERIC, 2);
      
      -- Update USD rate
      UPDATE public.exchange_rates
      SET 
        rate = usd_rate,
        updated_at = NOW(),
        source = 'cron-api'
      WHERE currency = 'USD';
      
      -- Update EUR rate
      UPDATE public.exchange_rates
      SET 
        rate = eur_rate,
        updated_at = NOW(),
        source = 'cron-api'
      WHERE currency = 'EUR';
      
      RAISE NOTICE 'Exchange rates updated successfully: USD=%, EUR=%', usd_rate, eur_rate;
      RETURN;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Primary API failed: %', SQLERRM;
  END;
  
  -- Fallback: Try backup API
  BEGIN
    SELECT content::jsonb INTO api_response
    FROM http_get('https://open.er-api.com/v6/latest/INR');
    
    IF api_response IS NOT NULL AND 
       api_response->'rates' IS NOT NULL AND
       api_response->'rates'->>'USD' IS NOT NULL AND
       api_response->'rates'->>'EUR' IS NOT NULL THEN
      
      usd_rate := ROUND((1.0 / (api_response->'rates'->>'USD')::NUMERIC)::NUMERIC, 2);
      eur_rate := ROUND((1.0 / (api_response->'rates'->>'EUR')::NUMERIC)::NUMERIC, 2);
      
      UPDATE public.exchange_rates
      SET 
        rate = usd_rate,
        updated_at = NOW(),
        source = 'cron-api-backup'
      WHERE currency = 'USD';
      
      UPDATE public.exchange_rates
      SET 
        rate = eur_rate,
        updated_at = NOW(),
        source = 'cron-api-backup'
      WHERE currency = 'EUR';
      
      RAISE NOTICE 'Exchange rates updated from backup API: USD=%, EUR=%', usd_rate, eur_rate;
      RETURN;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Backup API also failed: %', SQLERRM;
  END;
  
  RAISE WARNING 'Failed to update exchange rates from all APIs';
END;
$$;

-- Schedule the cron job to run daily at 2 AM UTC
-- This will automatically fetch and update exchange rates every day
SELECT cron.schedule(
  'fetch-exchange-rates-daily',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$SELECT public.fetch_and_update_exchange_rates();$$
);

-- View the scheduled job
-- SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';

-- To unschedule the job (if needed in future):
-- SELECT cron.unschedule('fetch-exchange-rates-daily');

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.fetch_and_update_exchange_rates() TO postgres;

-- Create a table to log cron execution history (optional but useful)
CREATE TABLE IF NOT EXISTS public.exchange_rates_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency VARCHAR(3) NOT NULL,
  rate NUMERIC(10, 2) NOT NULL,
  source VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on history table
ALTER TABLE public.exchange_rates_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read history
CREATE POLICY "Anyone can read exchange rates history"
  ON public.exchange_rates_history
  FOR SELECT
  TO public
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_currency ON public.exchange_rates_history(currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_updated_at ON public.exchange_rates_history(updated_at DESC);

-- Create trigger to log rate changes to history table
CREATE OR REPLACE FUNCTION public.log_exchange_rate_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.exchange_rates_history (currency, rate, source, updated_at)
  VALUES (NEW.currency, NEW.rate, NEW.source, NEW.updated_at);
  RETURN NEW;
END;
$$;

CREATE TRIGGER exchange_rates_history_trigger
  AFTER UPDATE ON public.exchange_rates
  FOR EACH ROW
  WHEN (OLD.rate IS DISTINCT FROM NEW.rate)
  EXECUTE FUNCTION public.log_exchange_rate_change();

-- Log initial rates to history
INSERT INTO public.exchange_rates_history (currency, rate, source, updated_at)
SELECT currency, rate, source, updated_at 
FROM public.exchange_rates
WHERE NOT EXISTS (
  SELECT 1 FROM public.exchange_rates_history 
  WHERE exchange_rates_history.currency = exchange_rates.currency
);

COMMENT ON TABLE public.exchange_rates_history IS 'Historical log of all exchange rate changes';
COMMENT ON FUNCTION public.fetch_and_update_exchange_rates() IS 'Fetches latest exchange rates from API and updates the database';
