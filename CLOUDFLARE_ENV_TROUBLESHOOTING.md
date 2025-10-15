# Cloudflare Environment Variables - Verification Checklist

## Current Issue
Payment verification failing with "Failed to update order status"

## Root Cause
Cloudflare Functions were updated to use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY`, but the environment variable might not be set with the correct name.

## Required Environment Variables in Cloudflare

Go to: https://dash.cloudflare.com/
Navigate to: **Pages** → **nirchal** → **Settings** → **Environment Variables** → **Production**

### You MUST have these exact variable names:

| Variable Name | Value | Type | Status |
|--------------|-------|------|--------|
| `SUPABASE_URL` | `https://tazrvokohjfzicdzzxia.supabase.co` | Plain text | ✅ Should exist |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service role key) | 🔒 Encrypted | ⚠️ **CHECK THIS** |
| `RAZORPAY_KEY_ID` | `rzp_test_XXX` or `rzp_live_XXX` | 🔒 Encrypted | ✅ Should exist |
| `RAZORPAY_KEY_SECRET` | `XXX...` | 🔒 Encrypted | ✅ Should exist |
| `RAZORPAY_WEBHOOK_SECRET` | `XXX...` | 🔒 Encrypted | ✅ Should exist |

### Client-Side Variables (separate):
| Variable Name | Value | Type |
|--------------|-------|------|
| `VITE_SUPABASE_URL` | `https://tazrvokohjfzicdzzxia.supabase.co` | Plain text |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (anon key) | Plain text |
| `VITE_R2_PUBLIC_URL` | `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev` | Plain text |
| `R2_PUBLIC_URL` | `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev` | Plain text |

## Common Mistakes

### ❌ Wrong Variable Name
- If you have `SUPABASE_ANON_KEY` → **DELETE IT**
- Must be `SUPABASE_SERVICE_ROLE_KEY` (exact spelling)

### ❌ Wrong Key Type
- If you put the anon key in `SUPABASE_SERVICE_ROLE_KEY` → **WRONG**
- Service role key starts with: `eyJhbGc...` and has `role: 'service_role'` when decoded

### ❌ Not Encrypted
- `SUPABASE_SERVICE_ROLE_KEY` MUST be marked as "Encrypted"
- All Razorpay keys MUST be marked as "Encrypted"

## How to Get Service Role Key

1. Go to: https://supabase.com/dashboard/project/tazrvokohjfzicdzzxia/settings/api
2. Look for: **Service Role Key** (NOT anon key)
3. Click "Copy" or "Reveal" to see the full key
4. It should be MUCH LONGER than the anon key
5. Copy this EXACT value to Cloudflare

## Verification Steps

### 1. Check Cloudflare Environment Variables
```
- Go to Cloudflare Dashboard
- Pages → nirchal → Settings → Environment Variables
- Production tab
- Look for: SUPABASE_SERVICE_ROLE_KEY
- Verify it exists and is encrypted
```

### 2. If Variable is Missing or Wrong
```
- Click "Add variable" or "Edit"
- Variable name: SUPABASE_SERVICE_ROLE_KEY
- Value: [Paste service role key from Supabase]
- Type: Encrypted ✓
- Environment: Production
- Click "Save"
```

### 3. Redeploy
```powershell
git commit --allow-empty -m "Trigger redeploy for env var fix"
git push origin uat
```

### 4. Wait 2-3 Minutes
- Cloudflare will automatically redeploy
- Functions will restart with new env vars

### 5. Check Deployment Logs
```
- Go to: Pages → nirchal → Deployments
- Click latest deployment
- Check "Functions" tab
- Look for console.log output
```

### 6. Test Payment
```
- Create test order
- Use test card: 4111 1111 1111 1111
- Complete payment
- Should succeed now
```

## Debug: Check Function Logs

If still failing, check Cloudflare function logs:
1. Go to: Pages → nirchal → Deployments → [Latest] → Functions
2. Look for these log lines:
   - ✅ "Payment signature verified successfully"
   - ❌ "Missing Supabase credentials"
   - ❌ "Failed to update order"
3. If you see "Missing Supabase credentials" → env var not set correctly

## Last Resort: Verify Deployment

Check that the code was deployed:
1. Go to: Pages → nirchal → Deployments
2. Latest deployment should show commit: `85b5ea6`
3. Check deployment time (should be recent)
4. If not, push again to trigger redeploy

## Expected Console Output (Success)

```
Verify Razorpay Payment - Request received
Verifying payment: { order_id: 'xxx', razorpay_order_id: 'xxx', razorpay_payment_id: 'xxx' }
Payment signature verified successfully
✅ Payment verified and order updated: xxx
```

## Expected Console Output (Failure)

```
Failed to update order: {
  status: 401,
  statusText: 'Unauthorized',
  error: 'Invalid API key',
  order_id: 'xxx'
}
```

This tells you the service role key is wrong or not set.

---

**Most Likely Issue**: You have the variable but with the wrong name or wrong key.
**Quick Fix**: Delete any `SUPABASE_ANON_KEY` variable and add `SUPABASE_SERVICE_ROLE_KEY` with the service role key from Supabase API settings.
