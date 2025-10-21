# 🚀 Production Deployment Checklist

## Overview
This guide ensures a smooth deployment to production with all SEO, analytics, and social media integrations ready to go.

---

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables** 
Update `.env` file with production values:

```env
# Supabase (Already configured)
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key

# Domain Configuration
VITE_BASE_URL=https://nirchal.com

# Google Analytics 4 (ADD IN PRODUCTION)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# These will be managed via Admin Settings UI:
# - Facebook Pixel ID
# - Instagram Business ID
# - Site Title, Meta Description, Keywords
```

**⚠️ Important:** GA4 can be set via `.env` OR Admin Settings. Admin Settings takes priority.

---

### 2. **Generate SEO Files Before Deploy**

Run these commands before each deployment:

```bash
# Generate sitemap (252 URLs)
npm run generate-sitemap

# Generate Facebook/Instagram product feed (229 products)
npm run generate-product-feed

# Or generate both at once
npm run generate-all
```

**What this creates:**
- `public/sitemap.xml` - For Google Search Console
- `public/product-feed.xml` - For Facebook/Instagram Catalog

**✅ These files will be deployed with your app!**

---

### 3. **Build for Production**

```bash
# Test build locally
npm run build

# Preview production build
npm run preview
```

**Verify:**
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ All pages load correctly
- ✅ Forms work properly

---

## 🌐 Post-Deployment Steps

### Step 1: Verify Files Are Accessible

After deploying to production, verify these URLs work:

```
✅ https://nirchal.com/sitemap.xml
✅ https://nirchal.com/product-feed.xml
✅ https://nirchal.com/robots.txt
```

**Expected Response:** XML/Text content (not 404)

---

### Step 2: Configure Admin Settings

1. **Login to Admin Panel:**
   ```
   https://nirchal.com/admin/login
   ```

2. **Go to Settings → SEO Settings**

3. **Fill in Basic SEO:**
   - Site Title: `Nirchal - Authentic Indian Ethnic Wear`
   - Meta Description: `Shop authentic Indian ethnic wear online. Discover our curated collection of Kurtas, Sarees, Lehengas, and more. Free shipping across India!`
   - Meta Keywords: `indian ethnic wear, kurtas online, sarees, lehengas, traditional clothing`

4. **Fill in Analytics & Tracking:**
   - **Google Analytics 4 ID:** `G-XXXXXXXXXX` (get from [analytics.google.com](https://analytics.google.com))
   - **Facebook Pixel ID:** `123456789012345` (get from [business.facebook.com/events_manager](https://business.facebook.com/events_manager))
   - **Instagram Business ID:** `17841XXXXXXXXXX` (optional - get from Instagram Business Account)

5. **Click "Save Changes"**

6. **Refresh your website** - Settings now active!

---

### Step 3: Setup Google Analytics 4

#### A. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (bottom left)
3. Click "Create Property"
4. Enter:
   - Property name: `Nirchal`
   - Time zone: `India Time (GMT+5:30)`
   - Currency: `Indian Rupee (INR)`
5. Click "Next" → Choose "E-commerce" → "Create"

#### B. Get Measurement ID

1. Go to Admin → Property → Data Streams
2. Click your web stream
3. Copy **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Add to Admin Settings → SEO Settings → Google Analytics 4 ID
5. Save

#### C. Verify Tracking

1. Go to Reports → Realtime
2. Open your website in another tab
3. You should see yourself in real-time view (within 30 seconds)

**✅ If you see activity, tracking is working!**

---

### Step 4: Setup Facebook Pixel

#### A. Create Facebook Pixel

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Click "Connect Data Sources" → "Web"
3. Choose "Facebook Pixel" → "Connect"
4. Enter Pixel name: `Nirchal Pixel`
5. Enter website: `https://nirchal.com`
6. Click "Continue"

#### B. Get Pixel ID

1. In Events Manager, click your Pixel name
2. Click "Settings" tab
3. Copy **Pixel ID** (15-16 digits like `123456789012345`)
4. Add to Admin Settings → SEO Settings → Facebook Pixel ID
5. Save

#### C. Verify Tracking

1. Install [Facebook Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your website
3. Click extension icon
4. Should show:
   - ✅ Green checkmark
   - ✅ Your Pixel ID
   - ✅ PageView event fired

#### D. Test Events

1. View a product → Check Events Manager for "ViewContent"
2. Add to cart → Check for "AddToCart"
3. Start checkout → Check for "InitiateCheckout"

**✅ If events appear in Events Manager (within 2 minutes), tracking is working!**

---

### Step 5: Setup Google Search Console

#### A. Verify Ownership

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter: `https://nirchal.com`
4. Choose verification method:
   - **Recommended:** HTML file upload
   - **Alternative:** DNS TXT record
5. Follow instructions to verify
6. Click "Verify"

#### B. Submit Sitemap

1. In Search Console, click "Sitemaps" (left menu)
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Status should show "Success"

**Expected:** Google will start crawling within 24-48 hours

#### C. Request Indexing (Priority Pages)

1. In Search Console, use "URL Inspection" tool
2. Enter your key pages:
   - `https://nirchal.com/`
   - `https://nirchal.com/products`
   - Top 5-10 product URLs
3. Click "Request Indexing" for each

**✅ This speeds up Google's crawling of important pages**

---

### Step 6: Setup Facebook Catalog (For Auto-Publishing)

#### A. Create Catalog

1. Go to [Meta Commerce Manager](https://business.facebook.com/commerce/)
2. Click "Create Catalog"
3. Choose "E-commerce" → "Next"
4. Enter catalog name: `Nirchal Products`
5. Click "Create"

#### B. Add Product Feed

1. In your catalog, click "Data Sources" → "Add Items"
2. Choose "Data Feed" → "Next"
3. Fill in:
   - **Feed Name:** `Nirchal Product Feed`
   - **Feed URL:** `https://nirchal.com/product-feed.xml`
   - **Update Schedule:** Daily at 12:00 AM (recommended)
   - **Currency:** INR
   - **Country:** India
4. Click "Start Upload"

**✅ Facebook will fetch your product feed and begin importing products**

#### C. Wait for Initial Sync

- First sync: 10-30 minutes
- Check "Data Sources" tab for status
- All 229 products should appear in catalog

#### D. Review & Approve Products

1. Go to "Items" tab in Commerce Manager
2. Review product listings
3. Fix any errors (missing images, descriptions, etc.)
4. Products with status "Active" are ready for Facebook Shop

---

### Step 7: Setup Instagram Shopping

#### A. Requirements

- ✅ Instagram Business or Creator Account
- ✅ Facebook Page connected to Instagram
- ✅ Facebook Catalog with approved products
- ✅ Comply with Instagram Shopping policies

#### B. Connect Catalog

1. Open Instagram app → Go to Profile
2. Tap ☰ → Settings → Business
3. Tap "Shopping" → "Continue"
4. Select your Facebook Catalog: `Nirchal Products`
5. Tap "Done"

#### C. Wait for Approval

- Review time: 1-3 business days
- You'll receive notification when approved
- Once approved, you can tag products in posts

#### D. Tag Products in Posts

1. Create post with product image
2. Tap "Tag Products"
3. Search and select product from catalog
4. Post will show product tags
5. Users can tap to view and purchase

**✅ Products automatically sync from Facebook Catalog - no manual work needed!**

---

## 🔄 Ongoing Maintenance

### Daily / After Product Updates

After adding/updating products in admin panel:

```bash
# Regenerate product feed
npm run generate-product-feed

# Deploy updated feed
# (Your CI/CD will handle this automatically)
```

**Facebook will automatically fetch the updated feed at scheduled time (12:00 AM daily)**

### Weekly

1. **Check Google Search Console:**
   - Coverage errors
   - Crawl stats
   - Performance (clicks, impressions)

2. **Check Facebook Events Manager:**
   - Event tracking working
   - Pixel health check
   - Catalog sync errors

3. **Check Google Analytics:**
   - Traffic sources
   - Top products
   - Conversion rates

### Monthly

1. **Regenerate sitemap** (if products added/removed):
   ```bash
   npm run generate-sitemap
   ```

2. **Review SEO performance:**
   - Keyword rankings
   - Organic traffic trends
   - Top landing pages

3. **Update product feed** (if catalog structure changed):
   ```bash
   npm run generate-product-feed
   ```

---

## 📊 Expected Results Timeline

### Week 1-2
- ✅ Analytics tracking live
- ✅ Facebook Pixel capturing events
- ✅ Google starts crawling sitemap
- ✅ Facebook Catalog syncs products

### Week 3-4
- ✅ Products appear in Google search (for branded searches)
- ✅ Facebook Shop active
- ✅ Instagram Shopping approved
- ✅ Basic analytics data accumulating

### Month 2-3
- ✅ Organic traffic from Google increases
- ✅ Product pages indexed
- ✅ Category pages ranking
- ✅ Rich snippets appearing in search

### Month 4-6
- ✅ Top 20 rankings for target keywords
- ✅ Consistent organic traffic
- ✅ Social commerce sales from Facebook/Instagram
- ✅ Retargeting campaigns running

---

## 🚨 Troubleshooting

### Analytics Not Working

**Issue:** No data in Google Analytics
**Fix:**
1. Check GA4 ID is correct in Admin Settings
2. Verify format: `G-XXXXXXXXXX`
3. Clear browser cache and test again
4. Check browser console for errors

**Issue:** Facebook Pixel not firing
**Fix:**
1. Check Pixel ID is correct in Admin Settings
2. Use Facebook Pixel Helper extension
3. Check browser console for errors
4. Verify no ad blockers interfering

---

### Product Feed Issues

**Issue:** Products not appearing in Facebook Catalog
**Fix:**
1. Verify feed URL accessible: `https://nirchal.com/product-feed.xml`
2. Check Data Sources tab in Commerce Manager for errors
3. Validate XML format: [XML Validator](https://www.xmlvalidation.com/)
4. Regenerate feed: `npm run generate-product-feed`
5. Re-upload or wait for next scheduled fetch

**Issue:** Some products rejected
**Fix:**
1. Check "Items" tab in Commerce Manager
2. Look for error messages (missing price, image, description)
3. Fix in admin panel
4. Regenerate feed and wait for sync

---

### Google Search Console Issues

**Issue:** Sitemap errors
**Fix:**
1. Verify sitemap URL: `https://nirchal.com/sitemap.xml`
2. Check for XML format errors
3. Regenerate: `npm run generate-sitemap`
4. Resubmit in Search Console

**Issue:** Pages not indexed
**Fix:**
1. Use URL Inspection tool
2. Check for crawl errors
3. Request indexing manually
4. Check robots.txt not blocking: `https://nirchal.com/robots.txt`
5. Ensure pages accessible (not noindex)

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] Website deployed and accessible
- [ ] sitemap.xml accessible at `/sitemap.xml`
- [ ] product-feed.xml accessible at `/product-feed.xml`
- [ ] robots.txt accessible at `/robots.txt`
- [ ] Admin Settings configured (SEO tab)
- [ ] Google Analytics 4 ID added and verified
- [ ] Facebook Pixel ID added and verified
- [ ] Google Search Console verified and sitemap submitted
- [ ] Facebook Catalog created and feed configured
- [ ] Instagram Shopping connection requested (if applicable)
- [ ] Test purchase completed successfully
- [ ] All analytics events firing correctly

---

## 📚 Reference Links

**Analytics & Tracking:**
- Google Analytics: https://analytics.google.com/
- Facebook Events Manager: https://business.facebook.com/events_manager
- Facebook Pixel Helper: [Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

**SEO & Search:**
- Google Search Console: https://search.google.com/search-console
- Rich Results Test: https://search.google.com/test/rich-results
- PageSpeed Insights: https://pagespeed.web.dev/

**Social Commerce:**
- Meta Commerce Manager: https://business.facebook.com/commerce/
- Instagram Shopping Setup: https://help.instagram.com/1187859655048322
- Facebook Catalog API Docs: https://developers.facebook.com/docs/marketing-api/catalog

---

**Status:** ✅ Complete Framework - Production Ready  
**Last Updated:** October 21, 2025  
**Next Action:** Deploy to production and follow this checklist step-by-step
