# Exchange Rates Management System

## Overview

This system allows manual management of currency exchange rates (USD and EUR against INR) through an admin panel, with automated updates via a cron job that fetches rates from xe.com (via exchangerate-api).

## Components

### 1. Database Table: `exchange_rates`

Stores exchange rates with audit trail.

**Migration File:** `supabase/migrations/20260606000001_create_exchange_rates.sql`

**Schema:**
- `id`: UUID primary key
- `currency`: VARCHAR(3) - Currency code (USD, EUR)
- `rate`: NUMERIC(10, 2) - Exchange rate (INR per unit)
- `updated_at`: TIMESTAMPTZ - Last update timestamp
- `updated_by`: UUID - User who updated (nullable for cron)
- `source`: VARCHAR(50) - Source of rate ('manual', 'xe.com', 'cron')
- `created_at`: TIMESTAMPTZ - Creation timestamp

### 2. Admin UI: Exchange Rates Page

**File:** `src/pages/admin/ExchangeRatesPage.tsx`

**Features:**
- View current USD and EUR rates
- Manually update rates
- Fetch latest rates from xe.com on demand
- View last update timestamp and source
- See example conversions with current rates

**Access:** `/admin/exchange-rates`

### 3. Currency Context

**File:** `src/contexts/CurrencyContext.tsx`

**Changes:**
- Removed all external API calls (exchangerate-api, open.er-api, frankfurter.app)
- Removed hardcoded fallback rates
- Now fetches rates from database via `fetchExchangeRatesFromDB()`
- Real-time subscription to database changes

### 4. Supabase Edge Function

**File:** `supabase/functions/fetch-exchange-rates/index.ts`

**Purpose:** Fetches latest exchange rates and updates database

**Data Source:**
- Primary: `exchangerate-api.com` (free tier)
- Fallback: `open.er-api.com`
- Can be updated to use actual xe.com API with credentials

## Conversion Formula

The conversion formula remains unchanged:

```
Final Price = (INR price / (base_rate - 5)) × multiplier
```

**Where:**
- `base_rate`: Exchange rate from database (e.g., 88 for USD, 102 for EUR)
- `markup`: 5 INR subtracted from base rate
- `multiplier`: 2x for USD, 1.5x for EUR

**Examples:**
- ₹1,000 → $24.10 (using USD rate of 88)
- ₹1,000 → €15.46 (using EUR rate of 102)

## Setup Instructions

### Step 1: Apply Database Migration

```bash
# Navigate to project root
cd d:\ITWala Projects\nirchal

# Apply migrations using Supabase CLI
supabase db push

# This will apply both migrations:
# 1. 20260606000001_create_exchange_rates.sql - Creates the exchange_rates table
# 2. 20260606000002_setup_exchange_rates_cron.sql - Sets up automatic daily updates

# Or apply manually in Supabase Dashboard > SQL Editor
# Copy and run both migration files in order
```

The second migration automatically sets up:
- ✅ Daily cron job (runs at 2 AM UTC)
- ✅ Automatic rate fetching from API
- ✅ Rate history tracking
- ✅ Fallback API if primary fails

### Step 4: Optional Edge Function Deployment (Advanced)

The Edge Function is optional since the cron job now fetches rates directly. However, you can still deploy it for manual API calls:

```bash
# Deploy the fetch-exchange-rates function
supabase functions deploy fetch-exchange-rates

# Set environment variables (if not already set)
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Test the System

1. **Test Manual Update:**
   - Login as admin
   - Go to `/admin/exchange-rates`
   - Change USD or EUR rate
   - Click "Save Exchange Rates"
   - Verify rates are updated

2. **Test Fetch Latest Rates:**
   - Click "Fetch Latest Rates" button
   - Check console logs
   - Verify rates are updated with source "cron-api"

3. **Test Cron Function Manually:**
   ```sql
   -- Run this in Supabase SQL Editor
   SELECT public.fetch_and_update_exchange_rates();
   
   -- Check the results
   SELECT * FROM public.exchange_rates;
   SELECT * FROM public.exchange_rates_history ORDER BY updated_at DESC LIMIT 5;
   ```

4. **Test Frontend:**
   - Browse products on the website
   - Switch currency using the currency dropdown
   - Verify prices update correctly

5. **Monitor Cron Execution:**
   ```sql
   -- Check if cron job is running
   SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';
   
   -- View execution history
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
   ORDER BY start_time DESC;
   ```

### Step 3: Verify Cron Job Setup

The cron job is automatically set up by the migration. To verify it's working:

```sql
-- View scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';

-- View cron execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
ORDER BY start_time DESC 
LIMIT 10;

-- View exchange rate history
SELECT * FROM public.exchange_rates_history 
ORDER BY updated_at DESC 
LIMIT 20;

-- Manually trigger the function to test
SELECT public.fetch_and_update_exchange_rates();
```

**Important Notes:**
- The cron job runs daily at **2 AM UTC**
- If both APIs fail, rates remain unchanged (logged as warning)
- All rate changes are logged in `exchange_rates_history` table
- You can still manually update rates via admin panel anytime

### Step 4: Optional Edge Function Deployment (Advanced)

1. **Test Manual Update:**
   - Login as admin
   - Go to `/admin/exchange-rates`
   - Change USD or EUR rate
   - Click "Save Exchange Rates"
   - Verify rates are updated

2. **Test Fetch from xe.com:**
   - Click "Fetch from XE.com" button
   - Check console logs
   - Verify rates are updated with source "xe.com"

3. **Test Frontend:**
   - Browse products on the website
   - Switch currency using the currency dropdown
   - Verify prices update correctly

4. **Test Cron Job:**
   ```bash
   # Manually trigger the edge function
   curl -X POST \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-exchange-rates
   ```

## Monitoring

### Check Exchange Rates

```sql
-- View current rates
SELECT * FROM exchange_rates ORDER BY currency;

-- View rate history (requires audit table - optional)
SELECT * FROM exchange_rates ORDER BY updated_at DESC;
```

### Check Cron Status

```sql
-- View scheduled jobs
SELECT * FROM cron.job;

-- View cron execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Frontend Debugging

Open browser console and check:
```javascript
// View current exchange rates being used
console.log(window.__exchangeRates);
```

## Troubleshooting

### Issue: Rates not updating from cron

1. Check cron job is scheduled:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';
   ```

2. Check cron execution logs:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
   ORDER BY start_time DESC LIMIT 5;
   ```

3. Test the function manually:
   ```sql
   SELECT public.fetch_and_update_exchange_rates();
   ```

4. Check if http extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'http';
   ```
   
   If not enabled, run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS http;
   ```

5. View PostgreSQL logs in Supabase Dashboard > Database > Logs

### Issue: Cron job exists but not executing

1. Check pg_cron extension is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Verify cron job syntax:
   ```sql
   SELECT jobname, schedule, command, active 
   FROM cron.job 
   WHERE jobname = 'fetch-exchange-rates-daily';
   ```

3. Unschedule and reschedule:
   ```sql
   SELECT cron.unschedule('fetch-exchange-rates-daily');
   SELECT cron.schedule(
     'fetch-exchange-rates-daily',
     '0 2 * * *',
     $$SELECT public.fetch_and_update_exchange_rates();$$
   );
   ```

### Issue: Frontend showing old rates

1. Check browser console for errors
2. Verify real-time subscription is working
3. Hard refresh the page (Ctrl+Shift+R)
4. Clear localStorage and refresh

### Issue: Permission denied when updating rates

1. Verify user has admin role:
   ```sql
   SELECT id, email, role FROM users WHERE id = 'USER_UUID';
   ```

2. Check RLS policies on exchange_rates table

### Issue: API rate limits

The free tier APIs have rate limits. If you exceed them:
- Consider upgrading to paid API
- Use xe.com official API (requires API key)
- Adjust cron frequency (e.g., once per day instead of hourly)

## API Credentials for xe.com

If you want to use the official xe.com API:

1. Sign up at https://www.xe.com/xecurrencydata/
2. Get API credentials
3. Update the edge function (`supabase/functions/fetch-exchange-rates/index.ts`):

```typescript
// Replace fetchExchangeRates function with:
async function fetchExchangeRates(): Promise<{ USD: number; EUR: number }> {
  const XE_API_KEY = Deno.env.get('XE_API_KEY');
  const XE_API_ID = Deno.env.get('XE_API_ID');
  
  const response = await fetch(
    `https://xecdapi.xe.com/v1/convert_from.json/?from=INR&to=USD,EUR&amount=1`,
    {
      headers: {
        'Authorization': `Basic ${btoa(`${XE_API_ID}:${XE_API_KEY}`)}`,
      },
    }
  );
  
  const data = await response.json();
  
  return {
    USD: data.to[0].mid,
    EUR: data.to[1].mid,
  };
}
```

4. Set secrets:
```bash
supabase secrets set XE_API_KEY=your_key
supabase secrets set XE_API_ID=your_id
```

## Future Enhancements

1. **Rate History:** Track historical rates for analytics
2. **Rate Alerts:** Notify admin of significant rate changes
3. **Multi-currency:** Add support for more currencies
4. **Rate Comparison:** Compare rates from multiple sources
5. **Manual Override:** Allow temporary rate locks during promotions

## Support

For issues or questions, contact the development team.
