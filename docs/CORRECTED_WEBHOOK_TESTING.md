# ✅ CORRECTED Razorpay Webhook Testing Guide

## 🚨 Important Correction
**There is NO "Test Webhook" button in Razorpay Dashboard**. Here are the correct testing methods:

---

## Method 1: Real Payment Test (Most Reliable)

### Step 1: Make Test Payment
1. **Go to your website**: https://nirchal.com
2. **Add items to cart** and proceed to checkout
3. **Use these Razorpay test credentials**:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry Date**: Any future date (e.g., `12/25`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Cardholder Name**: Any name

### Step 2: Verify Webhook Working
After successful payment:
- ✅ **Order status** should automatically change from "pending" to "paid"
- ✅ **Customer** should receive order confirmation email
- ✅ **Payment details** should be saved in database
- ✅ **Inventory** should be updated (if applicable)

---

## Method 2: Check Webhook Endpoint (Technical)

### Direct Endpoint Test
```bash
# Test webhook endpoint accessibility
curl -X POST https://nirchal.com/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: test" \
  -d '{"test": "connectivity"}'
```

**Expected Response**: 
```json
{"error":"Invalid signature"}
```
**Status**: 400 Bad Request ✅ (This is correct - means webhook is working)

---

## Method 3: Monitor Webhook Activity

### Check Cloudflare Function Logs
1. **Go to**: [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Navigate to**: Pages → nirchal → Functions
3. **Select**: `razorpay-webhook` function
4. **View logs** for webhook activity

**Look for these log entries after making a payment**:
```
🔔 RAZORPAY WEBHOOK TRIGGERED - Request received
Webhook signature verified successfully
🔔 Webhook event received: payment.captured
✅ Order status updated to paid
```

---

## Method 4: Database Verification

### Check Database Changes
After making a test payment, verify in your database:

**Orders Table - Should show**:
```sql
SELECT order_number, payment_status, razorpay_payment_id, updated_at 
FROM orders 
WHERE payment_status = 'paid' 
ORDER BY updated_at DESC 
LIMIT 5;
```

**Expected Results**:
- `payment_status` = `paid`
- `razorpay_payment_id` = populated with payment ID
- `updated_at` = recent timestamp
- `payment_details` = JSON with payment information

---

## Method 5: Return Workflow Test

### Test Refund Webhooks
1. **Create a return request** via customer dashboard
2. **Admin processes refund** via admin panel
3. **Check if customer receives refund emails** automatically
4. **Verify return status updates** to "refund_completed"

---

## 🔍 Webhook Success Indicators

### ✅ Webhook is Working When:
1. **Real payments**: Order status updates automatically to "paid"
2. **Function logs**: Show successful webhook processing in Cloudflare
3. **Database**: Payment details are populated correctly
4. **Emails**: Customers receive automatic confirmation emails
5. **Refunds**: Return workflow emails are sent automatically

### ❌ Webhook Issues When:
1. **Manual updates needed**: Order status stays "pending" after payment
2. **No logs**: No webhook activity in Cloudflare function logs
3. **Missing data**: Payment details not saved in database
4. **No emails**: Customers don't receive confirmations
5. **Refund delays**: Return emails not sent automatically

---

## 🎯 RECOMMENDED TESTING SEQUENCE

### Quick Test (5 minutes):
1. **Make test payment** with test card
2. **Check order status** updates automatically
3. **Verify email received** (if configured)

### Complete Test (15 minutes):
1. **Make test payment**
2. **Check Cloudflare logs** for webhook activity
3. **Verify database** payment details
4. **Test return request** → admin refund → webhook email
5. **Monitor all automatic emails**

---

## 🚀 Current Webhook Status

✅ **Endpoint**: `https://nirchal.com/razorpay-webhook` - Working  
✅ **Function**: Deployed and responding correctly  
✅ **Signature**: Validation working  
✅ **CORS**: Properly configured  
✅ **Events**: Handles payment + refund events  

**Next Step**: Make a test payment to verify end-to-end functionality! 💳