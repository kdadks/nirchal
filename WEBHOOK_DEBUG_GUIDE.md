# 🔍 Webhook Function Deployment Debug Guide

## Current Status: 405 Method Not Allowed

The webhook function is returning 405 errors, which suggests either:
1. **Functions not fully deployed yet** (most likely)
2. **Build error during deployment**
3. **Function export issues**

---

## ✅ IMMEDIATE TESTING STEPS

### Step 1: Check Cloudflare Pages Deployment

1. **Go to**: [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Navigate to**: Pages → nirchal → Deployments
3. **Check latest deployment**:
   - ✅ **Status**: Should show "Success" (not Building/Failed)
   - 📅 **Time**: Should be recent (within last few minutes)
   - 🔗 **Commit**: Should match your latest commit `b4fe49bb`

### Step 2: Check Function Build Logs

In the same deployment view:
1. **Click on the latest deployment**
2. **Look for "Functions" section in build logs**
3. **Check for errors** like:
   ```
   ❌ Error: Failed to build function razorpay-webhook
   ❌ TypeScript compilation errors
   ❌ Missing dependencies
   ```

### Step 3: Alternative Test Methods

Since direct curl is failing, try these:

#### A) Test via Razorpay Dashboard (Most Reliable)
1. **Go to**: [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → Webhooks
2. **Find your webhook**: `https://nirchal.com/functions/razorpay-webhook`
3. **Click "Test Webhook"**
4. **Select**: `payment.captured`
5. **Send Test** - This will give us the real response

#### B) Wait 5-10 Minutes
Cloudflare Functions sometimes need time to propagate globally.

#### C) Check Function Status
```bash
# Test if function exists (might return different status)
curl -X GET https://nirchal.com/functions/razorpay-webhook -v
```

---

## 🚨 Common Issues & Solutions

### Issue 1: TypeScript Build Errors
**Symptoms**: Functions return 405 even after deployment shows "Success"
**Solution**: Check build logs for TypeScript errors

### Issue 2: Missing Environment Variables
**Symptoms**: Function exists but fails internally
**Solution**: Verify all 5 environment variables are set in Cloudflare Pages

### Issue 3: Function Export Problems
**Symptoms**: 405 Method Not Allowed
**Check**: Our function exports `onRequestPost` and `onRequestOptions` correctly

### Issue 4: Cloudflare Cache
**Symptoms**: Old version still running
**Solution**: Wait 10 minutes or purge cache

---

## 🔧 BACKUP PLAN

If functions still don't work, we can test the webhook logic using a different approach:

### Alternative: Use Pages _worker.js
Convert the function to a Pages Worker for more reliable deployment.

---

## 📊 CURRENT FUNCTION STATUS

✅ **Code**: Correct exports and structure  
❌ **Deployment**: 405 errors suggest deployment issue  
⏳ **Propagation**: May need more time  
❓ **Build**: Check Cloudflare build logs  

---

## 🎯 NEXT STEPS

1. **Check Cloudflare deployment status** (most important)
2. **Review build logs** for any errors
3. **Test via Razorpay Dashboard** (bypasses direct curl issues)
4. **Wait 5-10 minutes** for propagation
5. **If still failing**: Check environment variables

## 🚀 Expected Timeline

- **If deployment successful**: Should work in 2-5 minutes
- **If build errors**: Need to fix code and redeploy  
- **If env var issues**: Update variables and redeploy

**The most reliable test right now is via Razorpay Dashboard → Test Webhook!** 🎯