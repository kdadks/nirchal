# 🚨 RAZORPAY WEBHOOK URL FIX

## Problem
Razorpay webhook is failing because the URL is incorrect:
- **Current (Wrong)**: `https://nirchal.com/razorpay-webhook`
- **Should be**: `https://nirchal.com/functions/razorpay-webhook`

## Root Cause
Your application is deployed on **Cloudflare Pages**, not Netlify. Cloudflare Pages Functions use `/functions/` prefix, not the direct endpoint.

---

## ✅ IMMEDIATE FIX REQUIRED

### Single Webhook Configuration (Recommended)

**Best Practice**: Use ONE webhook URL that handles all events (payment + refund)

1. **Login to**: [Razorpay Dashboard](https://dashboard.razorpay.com)
2. **Navigate to**: Settings → Webhooks
3. **Find your webhook** and click **Edit**
4. **Update URL from**:
   ```
   https://nirchal.com/razorpay-webhook
   ```
   **To**:
   ```
   https://nirchal.com/functions/razorpay-webhook
   ```

5. **Ensure these events are selected**:
   - ✅ `payment.captured`
   - ✅ `payment.failed` 
   - ✅ `order.paid`
   - ✅ `refund.processed`
   - ✅ `refund.failed`
   - ✅ `refund.speed_changed`

6. **Save the webhook**

**Note**: The main webhook now handles both payment AND refund events in a single endpoint, following Razorpay best practices.

---

## 🔧 WEBHOOK ENDPOINT (SINGLE URL)

**Primary Webhook (Use This One)**:
- **File**: `functions/razorpay-webhook.ts`
- **URL**: `https://nirchal.com/functions/razorpay-webhook`
- **Purpose**: Handle ALL events (payment + refund)
- **Events Supported**:
  - `payment.captured`
  - `payment.failed`
  - `order.paid`
  - `refund.processed`
  - `refund.failed`
  - `refund.speed_changed`

**Legacy Files (No Longer Needed)**:
- ~~`functions/razorpay-refund-webhook.ts`~~ - Logic moved to main webhook
- ~~`functions/api/razorpay-webhook.ts`~~ - Alternative route (not needed)

---

## 🧪 TESTING THE FIX

### Step 1: Test Webhook Connectivity

```bash
# Test main webhook endpoint
curl -X POST https://nirchal.com/functions/razorpay-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}'

# Test refund webhook endpoint  
curl -X POST https://nirchal.com/functions/razorpay-refund-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}'
```

### Step 2: Test with Razorpay

1. **Go to**: Razorpay Dashboard → Settings → Webhooks
2. **Click**: "Test Webhook" next to your updated webhook
3. **Test multiple events**:
   - `payment.captured` - Should return HTTP 200
   - `refund.processed` - Should return HTTP 200
4. **Verify**: Both payment and refund events work on same URL

### Step 3: Test Real Payment Flow

1. **Make a test payment** on your site
2. **Check Cloudflare Pages logs**:
   - Go to Cloudflare Dashboard → Pages → nirchal → Functions
   - Check recent function executions
3. **Verify**: Order status updates in your database

---

## 🛡️ WEBHOOK SECURITY

Your webhooks use proper signature verification:

```typescript
// Webhook signature verification (already implemented)
const signature = request.headers.get('x-razorpay-signature');
const expectedSignature = crypto
  .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
  .update(bodyText)
  .digest('hex');
```

**Ensure your webhook secret is set in Cloudflare environment variables**:
- Variable: `RAZORPAY_WEBHOOK_SECRET`
- Value: (copy from Razorpay Dashboard webhook settings)

---

## 📋 POST-FIX CHECKLIST

- [ ] Updated main webhook URL in Razorpay Dashboard
- [ ] Added/updated refund webhook URL
- [ ] Tested webhook connectivity with curl
- [ ] Tested with Razorpay test webhook
- [ ] Made test payment to verify end-to-end flow
- [ ] Checked Cloudflare Pages function logs
- [ ] Verified webhook secret is set in Cloudflare environment
- [ ] Confirmed database updates are working
- [ ] Re-enabled webhook in Razorpay Dashboard (if disabled)

---

## 🚀 EXPECTED OUTCOME

After this fix:
1. ✅ Razorpay webhooks will successfully reach your endpoints
2. ✅ Payment status updates will work automatically  
3. ✅ Order confirmation emails will trigger
4. ✅ Refund webhooks will update return request statuses
5. ✅ No more webhook delivery failures from Razorpay

---

## 📞 TROUBLESHOOTING

### If webhooks still fail:

1. **Check Cloudflare Pages Functions logs**:
   - Dashboard → Pages → nirchal → Functions → View logs

2. **Verify environment variables are set**:
   - `RAZORPAY_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Test endpoints directly**:
   ```bash
   # Should return 200 OK
   curl -I https://nirchal.com/functions/razorpay-webhook
   ```

4. **Check webhook signature matching**:
   - Ensure webhook secret in Razorpay matches environment variable

---

**Time to Fix**: ~5 minutes  
**Impact**: Critical - fixes payment confirmation and refund processing