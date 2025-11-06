# 🔄 Refund Status Sync Fix - Implementation Summary

## Problem

Customer received refund in their bank account, but the admin panel still shows the transaction as "processing" (status = `refund_initiated` instead of `refund_completed`).

> **Important Note**: The application uses a **single webhook URL** (`https://nirchal.com/razorpay-webhook`) that handles BOTH payment and refund events. There is NO separate refund webhook endpoint.

### Root Cause

1. **Refund Creation**: When admin initiates refund, `createRefund()` service:
   - Calls Razorpay API to create refund
   - Saves transaction with status = `initiated` in `razorpay_refund_transactions` table
   - Updates `return_requests.status` to `refund_initiated`

2. **Status Update Mechanism**: Should update automatically via webhook:
   - Razorpay sends `refund.processed` webhook event when refund completes
   - Webhook handler at `functions/razorpay-refund-webhook.ts` updates database
   - Sets `razorpay_refund_transactions.status` to `processed`
   - Sets `return_requests.status` to `refund_completed`

3. **Missing Link**: Webhook not being triggered or not configured properly:
   - Razorpay webhook URL may not be configured
   - Webhook events may not include `refund.processed`
   - Webhook signature validation may be failing

---

## ✅ Solution Implemented

### 1. Manual Status Sync Function

**File**: `src/services/razorpayRefundService.ts`

**New Function**: `syncRefundStatus(returnRequestId: string)`

**What it does**:
1. Queries Razorpay API directly to get actual refund status
2. Updates `razorpay_refund_transactions` table with correct status
3. Updates `return_requests.status` based on refund status:
   - `processed` → `refund_completed`
   - `failed` → `approved` (allows retry)
4. Adds entry to `return_status_history`
5. Sends completion email to customer if status is `processed`

**Implementation**:
```typescript
export async function syncRefundStatus(returnRequestId: string): Promise<{
  success: boolean;
  status?: string;
  message?: string;
  error?: string;
}>
```

### 2. Admin UI Button

**File**: `src/components/returns/ReturnManagementDashboard.tsx`

**New Button**: "Sync Status" (appears when `status === 'refund_initiated'`)

**Features**:
- Only visible when refund status is `refund_initiated`
- Shows loading spinner while syncing
- Disabled during sync operation
- Refreshes dashboard data after successful sync
- Shows success/error toast notifications

**Handler Function**:
```typescript
const handleSyncRefundStatus = async (returnRequest: ReturnRequestWithItems) => {
  setSyncingStatus(returnRequest.id);
  
  try {
    const result = await syncRefundStatus(returnRequest.id);
    if (result.success) {
      toast.success(result.message || 'Refund status synced successfully!');
      loadReturns();
      loadStatistics();
    } else {
      toast.error(result.error || 'Failed to sync refund status');
    }
  } catch (error: any) {
    toast.error(error.message || 'An error occurred while syncing refund status');
  } finally {
    setSyncingStatus(null);
  }
};
```

---

## 🔧 How to Use (Immediate Fix)

### For Current Issue:

1. **Login to Admin Panel**
2. **Navigate to**: Returns Management
3. **Filter by**: "Refund Processing" status
4. **Find the return** with stuck status
5. **Click**: "Sync Status" button (blue button with refresh icon)
6. **Wait**: Button will show "Syncing..." with spinning icon
7. **Result**: Status will update to "Completed" if refund was processed

### Expected Result:
- ✅ `razorpay_refund_transactions.status` → `processed`
- ✅ `return_requests.status` → `refund_completed`
- ✅ Status history entry added
- ✅ Customer receives completion email (if not sent already)
- ✅ Admin sees updated status in dashboard

---

## 🛡️ Long-term Fix: Configure Webhook

To prevent this issue in the future, ensure Razorpay webhook is properly configured.

### Step 1: Verify Webhook Endpoint Exists

The webhook handler already exists:
- **File**: `functions/razorpay-webhook.ts`
- **URL**: `https://nirchal.com/razorpay-webhook` (single endpoint for all events)
- **Function**: Handles both payment AND refund events:
  - Payment: `payment.captured`, `payment.failed`, `order.paid`
  - Refund: `refund.processed`, `refund.failed`, `refund.speed_changed`

### Step 2: Configure Razorpay Dashboard

1. **Login to**: [Razorpay Dashboard](https://dashboard.razorpay.com)
2. **Navigate to**: Settings → Webhooks
3. **Add/Edit Webhook**:
   - **URL**: `https://nirchal.com/razorpay-webhook` (single URL for all events)
   - **Active Events**:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `order.paid`
     - ✅ `refund.processed`
     - ✅ `refund.failed`
     - ✅ `refund.speed_changed`
   - **Secret**: Copy webhook secret from dashboard

4. **Test Webhook**:
   - Click "Test Webhook" button
   - Send test `refund.processed` event
   - Verify response is HTTP 200

### Step 3: Set Environment Variable

Ensure `RAZORPAY_WEBHOOK_SECRET` is set in Cloudflare Pages:

1. **Go to**: Cloudflare Dashboard → Pages → nirchal
2. **Settings** → Environment Variables
3. **Add Variable**:
   - **Name**: `RAZORPAY_WEBHOOK_SECRET`
   - **Value**: (webhook secret from Razorpay Dashboard)
   - **Environment**: Production & Preview

### Step 4: Verify Webhook Logs

After configuration, test with a real refund:
1. Create a test refund via admin panel
2. Wait for Razorpay to process
3. **Check Cloudflare Logs**: Pages → Functions → View Logs
4. Look for: `🔄 Processing refund event: refund.processed`
5. Verify: Status updates automatically

### Step 5: Check Current Webhook Configuration

To verify webhook is properly configured in Razorpay:

1. **Go to**: [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → Webhooks
2. **Find your webhook** for `https://nirchal.com/razorpay-webhook`
3. **Verify**:
   - ✅ Status is "Active" (not disabled)
   - ✅ URL is `https://nirchal.com/razorpay-webhook` (NOT `/razorpay-refund-webhook`)
   - ✅ All 6 events are selected (payment + refund events)
   - ✅ Secret is configured
4. **Check Webhook History**:
   - Click on webhook → View History
   - Look for recent refund events
   - Check if they succeeded or failed
   - If failed, check error messages

---

## 📋 Webhook Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Admin Initiates Refund                                       │
│ - Status: approved → refund_initiated                        │
│ - Transaction: status = 'initiated'                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────────┐
│ Razorpay Processes Refund (async)                           │
│ - Customer receives money in bank account                    │
│ - Razorpay status changes to 'processed'                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATIC: Razorpay Webhook (if configured)                 │
│ - POST to https://nirchal.com/razorpay-webhook              │
│ - Handler: handleRefundEvent() in razorpay-webhook.ts       │
│ - Updates transaction: status = 'processed'                  │
│ - Updates return: status = 'refund_completed'                │
│ - Sends completion email to customer                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   v (IF WEBHOOK FAILS OR NOT CONFIGURED)
                   │
┌─────────────────────────────────────────────────────────────┐
│ MANUAL: Admin Clicks "Sync Status"                          │
│ - Queries Razorpay API for actual status                    │
│ - Updates database with correct status                       │
│ - Sends completion email if needed                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Issue: Sync Status button shows error

**Check**:
1. Is `RAZORPAY_KEY_ID` set in Cloudflare environment?
2. Is `RAZORPAY_KEY_SECRET` set in Cloudflare environment?
3. Is the refund ID valid in database?
4. Check browser console for error details

**Solution**:
- Verify environment variables in Cloudflare Pages settings
- Check Cloudflare Functions logs for API errors

### Issue: Status syncs but doesn't show in UI

**Check**:
1. Browser cache - hard refresh (Ctrl+Shift+R)
2. Database query filters
3. RLS policies on tables

**Solution**:
- Clear browser cache
- Check Supabase logs for query errors

### Issue: Webhook not being called

**Check**:
1. Webhook URL in Razorpay Dashboard
2. Webhook secret matches environment variable
3. Events are selected in webhook configuration

**Solution**:
- Re-save webhook in Razorpay Dashboard
- Test webhook using "Test Webhook" button
- Check Cloudflare Functions logs

---

## 📊 Database Schema Updates

No schema changes required. The solution works with existing schema:

### `razorpay_refund_transactions`
- `status`: 'pending' | 'initiated' | 'processed' | 'failed'
- `razorpay_status`: Mirror of Razorpay's actual status
- `razorpay_response`: Full API response from Razorpay
- `processed_at`: Timestamp when status became 'processed'

### `return_requests`
- `status`: 'refund_initiated' → 'refund_completed' (when processed)
- `razorpay_refund_id`: Used to query Razorpay API

### `return_status_history`
- New entry added when status is synced
- `notes`: "Status synced from Razorpay: processed"
- `created_by`: 'system'

---

## ✅ Testing Checklist

- [x] Build passes without errors
- [x] TypeScript compilation successful
- [x] Linting passes
- [ ] Manual test: Click "Sync Status" button
- [ ] Verify: Status updates in database
- [ ] Verify: Status updates in UI
- [ ] Verify: Email sent to customer
- [ ] Test: Webhook configuration in Razorpay
- [ ] Test: End-to-end refund flow

---

## 📝 Files Modified

1. **`src/services/razorpayRefundService.ts`**
   - Added `syncRefundStatus()` function (lines 515-704)
   - Queries Razorpay API via `/functions/check-razorpay-refund-status`
   - Updates database with actual status
   - Handles email notifications

2. **`src/components/returns/ReturnManagementDashboard.tsx`**
   - Imported `syncRefundStatus` from service
   - Added `syncingStatus` state for loading indication
   - Added `handleSyncRefundStatus()` handler
   - Added "Sync Status" button to UI (visible when status = 'refund_initiated')
   - Button shows loading state during sync

---

## 🚀 Next Steps

### Immediate (Already Complete):
1. ✅ Manual sync function implemented
2. ✅ Admin UI button added
3. ✅ Build passes

### Short-term (To Do):
1. ⏳ Configure Razorpay webhook URL
2. ⏳ Test webhook functionality
3. ⏳ Verify webhook secret in environment variables

### Long-term (Recommended):
1. Add monitoring/alerting for failed webhooks
2. Create admin dashboard for webhook health
3. Implement retry mechanism for failed webhook events
4. Add detailed logging for refund status changes

---

## 📞 Support

If issues persist:
1. Check Cloudflare Functions logs for errors
2. Check Supabase logs for database issues
3. Verify Razorpay API credentials
4. Test webhook manually using curl or Postman
5. Review `functions/check-razorpay-refund-status.ts` for API errors

---

## 🎯 Summary

**Problem**: Refund status stuck at "processing" even after customer received money

**Root Cause**: Webhook not updating database when Razorpay processes refund

**Solution**: 
- **Immediate**: Manual "Sync Status" button to query Razorpay and update database
- **Permanent**: Configure webhook properly to automate status updates

**Status**: ✅ Implemented and ready to use
