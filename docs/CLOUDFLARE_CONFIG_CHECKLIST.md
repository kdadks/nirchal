# Cloudflare Pages R2 Configuration Checklist

## ✅ What You Need to Do in Cloudflare Dashboard

### 1. Configure R2 Bucket Binding

**Location:** Cloudflare Dashboard → Pages → nirchal → Settings → Functions

**Steps:**
1. Scroll to **"R2 bucket bindings"** section
2. Click **"Add binding"**
3. Fill in:
   - **Variable name:** `PRODUCT_IMAGES`
   - **R2 bucket:** `product-images`
4. Click **"Save"**

**Why:** This gives your Cloudflare Functions direct access to the R2 bucket without needing AWS SDK or credentials.

---

### 2. Configure Environment Variable

**Location:** Cloudflare Dashboard → Pages → nirchal → Settings → Environment variables

**Steps:**
1. Click **"Add variable"**
2. Fill in:
   - **Variable name:** `R2_PUBLIC_URL`
   - **Value:** `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev`
   - **Environment:** Production (and optionally Preview)
3. Click **"Save"**

**Note:** You do NOT need to add:
- ❌ `R2_ACCESS_KEY_ID` (not needed with bucket binding)
- ❌ `R2_SECRET_ACCESS_KEY` (not needed with bucket binding)
- ❌ `R2_ACCOUNT_ID` (not needed with bucket binding)

---

### 3. Trigger Redeploy

**Location:** Cloudflare Dashboard → Pages → nirchal → Deployments

**Steps:**
1. Click **"Create deployment"** or wait for automatic deployment from Git push
2. Monitor build logs to ensure Cloudflare Functions are deployed
3. Look for confirmation that functions are available at:
   - `/upload-image-r2`
   - `/delete-image-r2`

---

## 🧪 Testing After Configuration

### 1. Check Function Endpoints

Open browser console and test:

```javascript
// Test upload endpoint
fetch('https://nirchal.pages.dev/upload-image-r2', {
  method: 'OPTIONS'
}).then(r => console.log('Upload endpoint:', r.status)); // Should be 204

// Test delete endpoint
fetch('https://nirchal.pages.dev/delete-image-r2', {
  method: 'OPTIONS'
}).then(r => console.log('Delete endpoint:', r.status)); // Should be 204
```

**Expected:** Status 204 (No Content) for both

---

### 2. Test Image Upload

1. Log into admin panel: https://nirchal.pages.dev/admin
2. Go to Products → Add New Product
3. Upload an image
4. Check browser console for:
   - ✅ `[Image Storage] Uploading ... to R2 via server function...`
   - ✅ `[Image Storage] Successfully uploaded to R2: https://pub-...`
   - ❌ No errors about 404 or 405

---

### 3. Verify Image Display

1. View a product page
2. Open Network tab (F12)
3. Check that images load from: `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev/products/...`
4. Status should be **200 OK**

---

## 🔧 Troubleshooting

### Issue: 404 Not Found on `/upload-image-r2`

**Cause:** Functions not deployed  
**Fix:** 
- Check build logs in Cloudflare Pages dashboard
- Verify `/functions/` directory exists in repository
- Redeploy

---

### Issue: 405 Method Not Allowed

**Cause:** R2 bucket binding not configured  
**Fix:**
- Go to Settings → Functions → R2 bucket bindings
- Add binding: `PRODUCT_IMAGES` → `product-images`
- Redeploy

---

### Issue: Images not displaying

**Cause:** R2 bucket not public or wrong URL  
**Fix:**
- Verify R2 bucket has public access enabled:
  - Cloudflare Dashboard → R2 → product-images → Settings → Public access → Allow Access
- Check `R2_PUBLIC_URL` environment variable is correct
- Test URL directly: `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev/products/test.jpg`

---

### Issue: `env.PRODUCT_IMAGES is undefined`

**Cause:** R2 binding not configured  
**Fix:**
- Add R2 bucket binding in Cloudflare Pages (see Step 1)
- Variable name MUST be exactly `PRODUCT_IMAGES`
- Bucket name MUST be exactly `product-images`

---

## 📁 File Structure

```
/functions/                    ← Cloudflare Functions (✅ USED)
  ├── upload-image-r2.ts      ← POST handler
  └── delete-image-r2.ts      ← DELETE handler

/netlify/functions/            ← Old Netlify Functions (❌ NOT USED)
  ├── upload-image-r2.ts      ← Can be deleted
  └── delete-image-r2.ts      ← Can be deleted

wrangler.toml                  ← Cloudflare configuration
CLOUDFLARE_R2_SETUP.md        ← Full documentation
```

---

## ✨ Expected Outcome

After completing all steps:

1. ✅ Image uploads work on production site
2. ✅ Images deleted when products deleted
3. ✅ All 1,005 existing images display from R2
4. ✅ No 404 or 405 errors in console
5. ✅ Admin panel fully functional

---

## 🚀 Next Steps After Success

1. Test all admin operations (create, update, delete products)
2. Test bulk product import with images
3. Monitor R2 usage in Cloudflare dashboard
4. (Optional) Delete old `/netlify/functions/` directory
5. (Optional) Remove `netlify.toml` if not using Netlify

---

## 📞 Support

If issues persist after following this checklist:
- Check Cloudflare Functions logs in dashboard
- Review `CLOUDFLARE_R2_SETUP.md` for detailed documentation
- Verify all environment variables and bindings are saved
- Try manual redeploy
