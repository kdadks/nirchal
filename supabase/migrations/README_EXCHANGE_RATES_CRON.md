# Exchange Rates Cron Job Migration

## Overview

This migration (`20260606000002_setup_exchange_rates_cron.sql`) sets up automatic daily updates for currency exchange rates in production.

## What It Does

### 1. Enables Required Extensions
- `pg_cron` - PostgreSQL cron job scheduler
- `http` - HTTP client for making API requests

### 2. Creates Fetch Function
Creates `public.fetch_and_update_exchange_rates()` that:
- Fetches latest USD and EUR rates from exchangerate-api.com
- Falls back to open.er-api.com if primary API fails
- Updates the `exchange_rates` table automatically
- Logs all activity for debugging

### 3. Schedules Daily Cron Job
- **Job Name:** `fetch-exchange-rates-daily`
- **Schedule:** Every day at 2 AM UTC (`0 2 * * *`)
- **Action:** Calls `fetch_and_update_exchange_rates()`

### 4. Creates History Tracking
- New table: `exchange_rates_history`
- Automatically logs every rate change
- Useful for auditing and analytics

### 5. Sets Up Trigger
- Automatically logs to history when rates change
- No manual intervention needed

## Verifying the Setup

After applying this migration, run these queries to verify:

```sql
-- 1. Check if cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';

-- Expected output:
-- jobid | schedule   | command                                      | nodename  | nodeport | database | username | active | jobname
-- ------|------------|----------------------------------------------|-----------|----------|----------|----------|--------|----------
-- 1     | 0 2 * * *  | SELECT public.fetch_and_update_exchange...  | localhost | 5432     | postgres | postgres | true   | fetch-exchange-rates-daily

-- 2. Manually trigger the function to test
SELECT public.fetch_and_update_exchange_rates();

-- Expected output:
-- NOTICE: Exchange rates updated successfully: USD=88.50, EUR=95.25
-- (or similar values)

-- 3. Check if rates were updated
SELECT * FROM public.exchange_rates;

-- Expected output:
-- id | currency | rate   | updated_at           | updated_by | source      | created_at
-- ---|----------|--------|----------------------|------------|-------------|------------
-- 1  | USD      | 88.50  | 2026-06-06 10:30:00 | NULL       | cron-api    | 2026-06-06 10:00:00
-- 2  | EUR      | 95.25  | 2026-06-06 10:30:00 | NULL       | cron-api    | 2026-06-06 10:00:00

-- 4. Check history table
SELECT * FROM public.exchange_rates_history ORDER BY updated_at DESC LIMIT 5;

-- 5. Check cron execution history (after first run)
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
ORDER BY start_time DESC;
```

## Monitoring

### Check Recent Executions
```sql
SELECT 
  start_time,
  end_time,
  status,
  return_message,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
ORDER BY start_time DESC
LIMIT 10;
```

### View Rate Change History
```sql
SELECT 
  currency,
  rate,
  source,
  updated_at,
  LAG(rate) OVER (PARTITION BY currency ORDER BY updated_at) as previous_rate,
  rate - LAG(rate) OVER (PARTITION BY currency ORDER BY updated_at) as change
FROM public.exchange_rates_history
ORDER BY updated_at DESC
LIMIT 20;
```

## Troubleshooting

### Cron Job Not Running

1. **Check if pg_cron is enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
   
2. **Check if job is active:**
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';
   ```
   
3. **View error logs:**
   ```sql
   SELECT return_message, status 
   FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily')
   AND status = 'failed'
   ORDER BY start_time DESC;
   ```

### API Request Failing

1. **Check if http extension is enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'http';
   ```

2. **Test API manually:**
   ```sql
   SELECT * FROM http_get('https://api.exchangerate-api.com/v4/latest/INR');
   ```

3. **Check function logs:**
   ```sql
   -- Enable logging
   SET client_min_messages TO NOTICE;
   
   -- Run function and watch logs
   SELECT public.fetch_and_update_exchange_rates();
   ```

### Rates Not Updating

1. **Verify function has correct permissions:**
   ```sql
   SELECT has_function_privilege('public.fetch_and_update_exchange_rates()', 'EXECUTE');
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'exchange_rates';
   ```

3. **Manual update test:**
   ```sql
   UPDATE public.exchange_rates 
   SET rate = 90.00, source = 'test' 
   WHERE currency = 'USD';
   
   -- Check if it worked
   SELECT * FROM exchange_rates WHERE currency = 'USD';
   ```

## Modifying the Schedule

To change when the cron job runs:

```sql
-- Unschedule existing job
SELECT cron.unschedule('fetch-exchange-rates-daily');

-- Reschedule with new time
-- Examples:
-- Every hour: '0 * * * *'
-- Every 6 hours: '0 */6 * * *'
-- Every day at 3 PM UTC: '0 15 * * *'
-- Every Monday at 9 AM UTC: '0 9 * * 1'

SELECT cron.schedule(
  'fetch-exchange-rates-daily',
  '0 15 * * *', -- Your new schedule
  $$SELECT public.fetch_and_update_exchange_rates();$$
);
```

## Removing the Cron Job

If you need to disable automatic updates:

```sql
-- Unschedule the job
SELECT cron.unschedule('fetch-exchange-rates-daily');

-- Verify it's removed
SELECT * FROM cron.job WHERE jobname = 'fetch-exchange-rates-daily';
-- Should return no rows
```

Note: This only removes the cron job. The function and tables remain intact for manual use.

## Production Considerations

1. **API Rate Limits:** The free tier APIs have limits. Monitor usage.
2. **Backup API:** The function automatically falls back to a secondary API.
3. **Manual Override:** Admins can still update rates manually via the admin panel.
4. **History Retention:** Consider periodically archiving old history records.
5. **Monitoring:** Set up alerts for failed cron executions in production.

## Security

- Function runs with `SECURITY DEFINER` (elevated privileges)
- Only accessible to authenticated users
- API calls are made server-side (safe)
- No credentials exposed to frontend
- All changes logged for audit trail

## Performance

- Cron job runs quickly (1-2 seconds)
- Minimal database load
- API calls are cached by function
- History table grows slowly (2 records per day)
- Indexes optimize query performance
