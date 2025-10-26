# Razorpay Webhook Setup Guide

## Overview
This guide explains how to set up Razorpay webhooks to automatically update refund statuses when Razorpay processes refunds.

## What the Webhook Does

When you initiate a refund through the admin panel:
1. **Immediate**: Status changes to `refund_initiated` ✅
2. **Immediate**: Customer receives email notification 📧
3. **5-7 days later**: Razorpay processes the refund
4. **Automatic via Webhook**: Status updates to `refund_completed` ✅
5. **Automatic via Webhook**: Customer receives completion email 📧

## Setup Instructions

### 1. Configure Razorpay Webhook

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com
   - Navigate to **Settings** → **Webhooks**

2. **Add Webhook URL**
   - Click **+ Add New Webhook**
   - Webhook URL: `https://nirchal.pages.dev/api/razorpay-webhook`
   - For test mode: Use test mode toggle and same URL

3. **Select Events**
   - ✅ `refund.processed` - When refund is successfully processed
   - ✅ `refund.failed` - When refund fails (rare)
   - ⚠️ Optionally: `payment.captured` (already handled in checkout)

4. **Get Webhook Secret**
   - After creating, Razorpay will show your **Webhook Secret**
   - Copy this secret (starts with `whsec_`)
   - **Keep it secure!** This is used to verify webhook authenticity

### 2. Add Webhook Secret to Cloudflare

1. **Go to Cloudflare Pages Dashboard**
   - Navigate to https://dash.cloudflare.com
   - Select your **nirchal** project
   - Go to **Settings** → **Environment Variables**

2. **Add New Variable**
   - Variable name: `RAZORPAY_WEBHOOK_SECRET`
   - Value: Your webhook secret from Razorpay (e.g., `whsec_xxxxxxxxxxxxx`)
   - Environment: **Production** (and Preview if needed)
   - Encrypt: ✅ Yes (recommended)
   - Click **Save**

3. **Redeploy** (if needed)
   - Cloudflare will automatically redeploy with new variables
   - Wait ~2 minutes for deployment

### 3. Test the Webhook

#### Option A: Using Razorpay Test Mode (Recommended)

1. **Add Test Balance**
   - In Razorpay dashboard, ensure **Test Mode** is ON
   - Go to **Account & Settings** → **Balance**
   - Add test balance (₹10,000 recommended)

2. **Create Test Refund**
   - Create a test order on your website
   - Pay using test credentials (card: `4111 1111 1111 1111`)
   - Mark order as delivered in admin
   - Create return request
   - Approve and initiate refund

3. **Verify Webhook**
   - Go to Razorpay → **Webhooks** → Select your webhook
   - Check **Webhook Logs** to see events sent
   - Refund should process within seconds in test mode
   - Status should update to `refund_completed`
   - Customer should receive completion email

#### Option B: Using Webhook Testing Tool

1. **Go to Razorpay Dashboard** → **Webhooks** → Your webhook
2. Click **Send Test Webhook**
3. Select `refund.processed` event
4. Click **Send**
5. Check Cloudflare Function logs to verify processing

### 4. Monitor Webhook Activity

#### In Razorpay Dashboard:
- **Settings** → **Webhooks** → Select webhook
- View **Event Logs** to see all webhook deliveries
- Check for failed deliveries (red ❌)

#### In Cloudflare Pages:
- Go to your project → **Functions** → **Logs**
- Filter by `/api/razorpay-webhook`
- Look for:
  ```
  ✅ Webhook signature verified
  ✅ Processing refund.processed: rfnd_xxxxx
  ✅ Refund transaction updated: processed
  ✅ Return request updated to refund_completed
  ✅ Refund completion email sent successfully
  ```

## Webhook Event Flow

### refund.processed Event

```
Razorpay
  ↓ (sends webhook)
/api/razorpay-webhook
  ↓ (verifies signature)
✅ Signature Valid
  ↓
Update razorpay_refund_transactions
  - status: 'initiated' → 'processed'
  - processed_at: timestamp
  ↓
Update return_requests
  - status: 'refund_initiated' → 'refund_completed'
  ↓
Add return_status_history entry
  ↓
Send email to customer
  📧 "Refund Completed - ₹X.XX Credited"
```

### refund.failed Event

```
Razorpay
  ↓ (sends webhook)
/api/razorpay-webhook
  ↓ (verifies signature)
✅ Signature Valid
  ↓
Update razorpay_refund_transactions
  - status: 'initiated' → 'failed'
  ↓
Add return_status_history entry
  - Note: "Refund failed. Admin needs to retry."
  ↓
Admin Dashboard
  ⚠️ Shows failed refund
  🔄 Admin can retry refund manually
```

## Security

### Webhook Signature Verification
Every webhook is verified using HMAC-SHA256:
```typescript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(requestBody)
  .digest('hex');

if (signature !== expectedSignature) {
  return 401 Unauthorized; // Reject invalid webhooks
}
```

**This prevents**:
- ✅ Unauthorized webhook calls
- ✅ Spoofed refund confirmations
- ✅ Data tampering

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook URL**
   - Must be publicly accessible
   - HTTPS required (not HTTP)
   - Correct URL: `https://nirchal.pages.dev/api/razorpay-webhook`

2. **Check Cloudflare Function**
   - Function deployed: `functions/api/razorpay-webhook.ts`
   - Check deployment logs for errors

3. **Check Razorpay Webhook Logs**
   - Look for failed deliveries
   - Check error messages

### Signature Verification Fails

1. **Verify Webhook Secret**
   - Check Cloudflare env var `RAZORPAY_WEBHOOK_SECRET`
   - Must match secret shown in Razorpay dashboard
   - No extra spaces or quotes

2. **Check Request Body**
   - Must be raw text (not parsed JSON)
   - Body must match exactly what Razorpay sent

### Status Not Updating

1. **Check Database Permissions**
   - Webhook uses `SUPABASE_SERVICE_ROLE_KEY`
   - Bypasses RLS policies
   - Verify key is correct in Cloudflare env vars

2. **Check Logs**
   - Cloudflare Function logs show errors
   - Look for database update errors
   - Verify `razorpay_refund_id` matches

### Email Not Sending

1. **Check Email Service**
   - Email function must be deployed
   - Verify SMTP credentials configured
   - Check email service logs

2. **Customer Email Missing**
   - Verify order has `billing_email`
   - Check return request has customer details

## Production Checklist

Before going live with webhooks:

- [ ] Test mode webhook working correctly
- [ ] Webhook secret added to Cloudflare (encrypted)
- [ ] Live mode webhook configured in Razorpay
- [ ] Live mode webhook secret added to Cloudflare
- [ ] Test refund processed successfully in test mode
- [ ] Email notifications working
- [ ] Status updates working correctly
- [ ] Webhook logs show successful deliveries
- [ ] Database updates verified
- [ ] Error handling tested (failed webhook signature, etc.)

## Environment Variables Required

```bash
# Cloudflare Pages Environment Variables
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # From Razorpay webhook setup
VITE_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...          # Service role for RLS bypass
```

## Support

If you encounter issues:
1. Check Cloudflare Function logs
2. Check Razorpay webhook logs
3. Verify all environment variables are set correctly
4. Test with Razorpay's "Send Test Webhook" feature
5. Check database for refund transaction records

## Future Enhancements

Consider implementing:
- [ ] Retry mechanism for failed webhooks
- [ ] Admin notifications for failed refunds
- [ ] Webhook event history in admin dashboard
- [ ] Automatic retry for failed refunds
- [ ] SMS notifications for refund completion
