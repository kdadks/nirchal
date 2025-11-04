# 🧪 Razorpay Webhook Testing Guide

## Method 1: Razorpay Dashboard Test (Recommended)

### Step 1: Test via Razorpay Dashboard
1. **Go to**: [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → Webhooks
2. **Find your webhook** with URL: `https://nirchal.com/functions/razorpay-webhook`
3. **Click "Test Webhook"** button next to your webhook
4. **Select Event**: `payment.captured`
5. **Click "Send Test"**
6. **Expected Result**: Should show "✅ 200 OK" response

### Step 2: Test Multiple Events
Test these events one by one:
- ✅ `payment.captured` - Should return 200 OK
- ✅ `payment.failed` - Should return 200 OK  
- ✅ `order.paid` - Should return 200 OK
- ✅ `refund.processed` - Should return 200 OK
- ✅ `refund.failed` - Should return 200 OK

---

## Method 2: Direct Endpoint Test (Manual)

### Test Webhook Endpoint Accessibility
```bash
# Test if endpoint is accessible
curl -X POST https://nirchal.com/functions/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test" \
  -d '{"test": "connectivity"}'
```

**Expected Response**: Should return HTTP 400 (due to invalid signature, but means endpoint is reachable)

---

## Method 3: Real Payment Test (Complete Flow)

### Make a Test Payment
1. **Go to your website**: https://nirchal.com
2. **Add item to cart** and proceed to checkout
3. **Use Razorpay test credentials**:
   - **Test Card**: 4111 1111 1111 1111
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
   - **Name**: Any name
4. **Complete payment**
5. **Check**: Order status should update to "paid" in your database

---

## Method 4: Check Cloudflare Function Logs

### View Real-time Logs
1. **Go to**: [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Navigate to**: Pages → nirchal → Functions
3. **Click on**: `razorpay-webhook` function
4. **View logs** to see webhook requests

**Look for these log entries**:
```
🔔 RAZORPAY WEBHOOK TRIGGERED - Request received at: [timestamp]
Webhook signature verified successfully
🔔 Webhook event received: payment.captured
✅ Order status updated to paid
```

---

## Method 5: Database Verification

### Check Database Changes
After making a test payment, verify in your database:

**Orders Table**:
- `payment_status` should change from `pending` to `paid`
- `razorpay_payment_id` should be populated
- `payment_details` should contain payment information

**Example Query**:
```sql
SELECT order_number, payment_status, razorpay_payment_id, updated_at 
FROM orders 
WHERE payment_status = 'paid' 
ORDER BY updated_at DESC 
LIMIT 5;
```

---

## 🚨 Troubleshooting Guide

### If Webhook Test Returns Error:

#### 400 Bad Request
- **Issue**: Missing or invalid signature
- **Solution**: Normal for manual testing, means endpoint is accessible

#### 404 Not Found  
- **Issue**: Wrong URL
- **Check**: Ensure URL is `https://nirchal.com/functions/razorpay-webhook` (not `/razorpay-webhook`)

#### 500 Internal Server Error
- **Issue**: Function error
- **Check**: Cloudflare function logs for error details
- **Verify**: Environment variables are set in Cloudflare Pages

#### Timeout/No Response
- **Issue**: Function not deployed or domain issues
- **Check**: Cloudflare Pages deployment status
- **Verify**: Custom domain is properly configured

### Common Environment Variables to Check:
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_URL` 
- `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Success Indicators

### Webhook is Working If:
1. **Razorpay Dashboard Test**: Returns 200 OK for test events
2. **Real Payment Test**: Order status updates automatically to "paid"
3. **Function Logs**: Show successful webhook processing
4. **Database**: Payment details are populated correctly
5. **Emails**: Customer receives order confirmation (if configured)

### Return Workflow Testing:
1. **Create Return Request**: Admin should receive notification email
2. **Mark as Received**: Customer gets confirmation email
3. **Complete Inspection**: Customer gets results email
4. **Process Refund**: Customer gets refund emails

---

## 📊 Monitoring Dashboard

### Key Metrics to Monitor:
- **Webhook Success Rate**: Should be 100% for valid requests
- **Order Conversion**: Pending → Paid status changes
- **Email Delivery**: Confirmation emails sent
- **Function Execution Time**: Should be under 10 seconds

### Set Up Alerts:
- Webhook failures in Cloudflare logs
- Failed payment status updates
- Email delivery failures

---

**Quick Test Command**: Use Razorpay Dashboard → Test Webhook → payment.captured → Should return 200 OK ✅