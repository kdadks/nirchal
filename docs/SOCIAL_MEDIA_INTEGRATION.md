# Social Media Integration & Auto-Publishing Guide

## 📊 Overview
This system integrates Google Analytics 4, Facebook Pixel, and Instagram tracking for comprehensive analytics across all channels. Products are tracked automatically through Facebook's Catalog system.

---

## ✅ What's Implemented

### 1. **Admin Settings - SEO Tab Enhanced**
**Location:** Admin → Settings → SEO Settings

**New Fields Added:**
- ✅ Google Analytics 4 ID (with G-XXXXXXXXXX format)
- ✅ Facebook Pixel ID (15-16 digits)
- ✅ Instagram Business ID (for tracking)

**Features:**
- All settings stored in database (`settings` table, category `seo`)
- No more hardcoded values or .env file needed
- Real-time updates without app restart
- Help text and links to documentation

---

### 2. **Database-Driven SEO Settings**
**File:** `src/App.tsx`

**What's loaded from database:**
- `site_title` - Used in `<title>` tag across entire site
- `meta_description` - Site-wide description for search engines
- `meta_keywords` - Keywords for SEO
- `google_analytics_id` - GA4 Measurement ID
- `facebook_pixel_id` - Facebook Pixel tracking ID
- `instagram_business_id` - Instagram business account ID

**Fallback behavior:**
- If database values not set, uses hardcoded defaults
- Graceful degradation if database connection fails
- Console warnings for missing values

---

### 3. **Dual Analytics Tracking**
**File:** `src/utils/analytics.ts`

**Google Analytics 4:**
- ✅ Page views
- ✅ Product views
- ✅ Add to cart
- ✅ Remove from cart
- ✅ Begin checkout
- ✅ Purchase completed
- ✅ Search queries
- ✅ Wishlist actions
- ✅ User sign up/login
- ✅ Category browsing

**Facebook Pixel:**
- ✅ PageView (automatic on init)
- ✅ ViewContent (product pages)
- ✅ AddToCart
- ✅ InitiateCheckout
- ✅ Purchase
- ✅ Search

**Both systems track simultaneously** - no conflicts, maximum data coverage.

---

## 📱 Facebook & Instagram Product Publishing

### How It Works

Facebook and Instagram use a **unified Catalog** system. When you publish a product to Facebook, it automatically becomes available on Instagram Shopping (if configured).

### Architecture:

```
Your Website (Nirchal)
    ↓
Facebook Catalog (Product Feed)
    ↓
    ├─→ Facebook Shop (automatic)
    └─→ Instagram Shopping (automatic)
```

### Implementation Options:

#### **Option 1: Facebook Product Feed (Recommended - Simple)**

**What you need:**
1. Facebook Business Manager account
2. Facebook Catalog created
3. Product feed URL configured

**Steps:**
1. Generate product feed XML/CSV on your server
2. Upload feed to Facebook Catalog
3. Facebook automatically syncs every 24 hours
4. Products appear on both Facebook & Instagram

**Pros:**
- ✅ Simple setup
- ✅ No API authentication needed
- ✅ Automatic updates
- ✅ Works for Instagram Shopping

**Cons:**
- ⏱️ Updates every 24 hours (not instant)

**File to create:** `public/catalog-feed.xml` or use API endpoint

---

#### **Option 2: Facebook Catalog API (Advanced - Real-time)**

**What you need:**
1. Facebook Business Manager account
2. Facebook App created
3. OAuth 2.0 setup with access tokens
4. Catalog permissions granted

**API Endpoints:**
```
POST /catalog/{catalog-id}/products - Create product
PATCH /product/{product-id} - Update product
DELETE /product/{product-id} - Delete product
```

**Pros:**
- ✅ Real-time publishing
- ✅ Immediate updates
- ✅ Full control

**Cons:**
- ❌ Complex OAuth setup
- ❌ Requires Facebook App approval
- ❌ Access token management

---

### Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Google Analytics 4 | ✅ **LIVE** | Auto-tracks all events |
| Facebook Pixel | ✅ **LIVE** | Auto-tracks all events |
| Instagram tracking | ✅ **LIVE** | Via Facebook Pixel |
| Product feed generation | ⏳ **TODO** | Need to build XML/CSV generator |
| Facebook Catalog setup | ⏳ **TODO** | Manual setup required |
| Auto-publish on create | ⏳ **TODO** | Depends on Catalog setup |

---

## 🚀 Setup Instructions

### Step 1: Configure Analytics IDs

1. **Get Google Analytics 4 ID:**
   - Go to https://analytics.google.com/
   - Create property → Get Measurement ID (G-XXXXXXXXXX)
   - Add to Admin → Settings → SEO Settings → Google Analytics 4 ID

2. **Get Facebook Pixel ID:**
   - Go to https://business.facebook.com/events_manager
   - Create Pixel → Get Pixel ID (15-16 digits)
   - Add to Admin → Settings → SEO Settings → Facebook Pixel ID

3. **Get Instagram Business ID (Optional):**
   - Go to Instagram Business Account → Settings
   - Find Business ID
   - Add to Admin → Settings → SEO Settings → Instagram Business ID

4. **Click "Save Changes"** in admin panel

5. **Refresh your website** - Analytics now active!

---

### Step 2: Verify Tracking

**Google Analytics 4:**
1. Go to https://analytics.google.com/
2. Click "Real-time" report
3. Open your website in another tab
4. Should see yourself in real-time view

**Facebook Pixel:**
1. Install [Facebook Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Open your website
3. Click extension icon
4. Should show green checkmark with your Pixel ID

---

### Step 3: Setup Facebook Catalog (For Auto-Publishing)

#### A. Create Facebook Catalog

1. Go to [Meta Commerce Manager](https://business.facebook.com/commerce/)
2. Click "Create Catalog"
3. Choose "E-commerce" as catalog type
4. Enter catalog name: "Nirchal Products"
5. Click "Create"

#### B. Option 1: Manual Product Feed (Simple)

**Create product feed XML:**

You need to create a file at `public/product-feed.xml` with this structure:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Nirchal Products</title>
    <link>https://nirchal.com</link>
    <description>Authentic Indian Ethnic Wear</description>
    <item>
      <g:id>product-id-123</g:id>
      <g:title>Modal Cotton Chikan Kurti</g:title>
      <g:description>Beautiful hand-embroidered kurti</g:description>
      <g:link>https://nirchal.com/products/modal-cotton-chikan-kurti</g:link>
      <g:image_link>https://nirchal.com/images/product-123.jpg</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>1299.00 INR</g:price>
      <g:brand>Nirchal</g:brand>
      <g:google_product_category>Apparel & Accessories > Clothing</g:google_product_category>
    </item>
    <!-- More products... -->
  </channel>
</rss>
```

**Configure in Facebook:**
1. Go to your Catalog in Commerce Manager
2. Click "Data Sources" → "Add Items"
3. Choose "Data Feed"
4. Enter feed URL: `https://nirchal.com/product-feed.xml`
5. Set schedule: Daily at 12:00 AM
6. Click "Start Upload"

#### C. Option 2: Facebook Catalog API (Real-time)

**This requires:**
1. Creating a Facebook App
2. Getting App ID and App Secret
3. Implementing OAuth flow
4. Getting long-lived access token
5. Building API integration

**I can implement this if you want real-time publishing**, but it's more complex.

---

### Step 4: Connect Instagram Shopping

1. Go to Instagram Business Account Settings
2. Click "Shopping"
3. Select your Facebook Catalog created above
4. Wait for approval (1-3 days)
5. Once approved, products from catalog auto-appear in Instagram

---

## 📊 Current Tracking Implementation

### Events Tracked on Website:

**Page Load:**
- GA4: `page_view`
- Facebook Pixel: `PageView`

**Product View:**
- GA4: `view_item` with product details
- Facebook Pixel: `ViewContent` with product ID, name, price

**Add to Cart:**
- GA4: `add_to_cart` with item details
- Facebook Pixel: `AddToCart` with content IDs, value

**Begin Checkout:**
- GA4: `begin_checkout` with cart items
- Facebook Pixel: `InitiateCheckout` with contents

**Purchase:**
- GA4: `purchase` with transaction ID
- Facebook Pixel: `Purchase` with order details

**Search:**
- GA4: `search` with search term
- Facebook Pixel: `Search` with search string

---

## 🔄 Auto-Publishing Workflow

### Current State (Manual):
1. Admin creates product in admin panel
2. Product saved to database
3. Product appears on website
4. Analytics track user interactions
5. **Manual:** Admin must manually add to Facebook Catalog

### Future State (Automated - Requires Implementation):
1. Admin creates product in admin panel
2. Product saved to database
3. **Auto:** Webhook triggers Facebook Catalog API
4. **Auto:** Product pushed to Facebook Catalog
5. **Auto:** Facebook syncs to Instagram
6. Product appears on all 3 channels simultaneously

---

## 📝 Next Steps for Full Auto-Publishing

### Option A: Product Feed Generator (Simpler)

**What to build:**
1. API endpoint: `/api/product-feed.xml`
2. Fetches all active products from database
3. Generates XML in Facebook's format
4. Returns XML response
5. Facebook Catalog fetches this URL daily

**Implementation time:** 2-3 hours

**Pros:**
- Simple to build
- No OAuth needed
- Reliable

**Cons:**
- Updates once per day
- Not real-time

---

### Option B: Facebook Catalog API Integration (Complex)

**What to build:**
1. Facebook OAuth flow
2. Access token storage
3. API wrapper for Catalog endpoints
4. Webhook on product create/update
5. Error handling & retry logic

**Implementation time:** 1-2 days

**Pros:**
- Real-time updates
- Full control
- Instant publishing

**Cons:**
- Complex setup
- Requires Facebook App approval
- Token management

---

## 🎯 Recommendation

### For MVP / Quick Launch:
1. ✅ Use current implementation (GA4 + Facebook Pixel)
2. ✅ Manually setup Facebook Catalog with product feed
3. ✅ Let Facebook auto-sync to Instagram
4. ⏳ Monitor analytics in both platforms

### For Future Enhancement:
1. Build product feed generator API
2. Automate feed updates (daily/hourly)
3. Consider Facebook Catalog API if need real-time

---

## 📚 Resources

**Google Analytics 4:**
- Dashboard: https://analytics.google.com/
- Documentation: https://developers.google.com/analytics/devguides/collection/ga4

**Facebook Pixel:**
- Events Manager: https://business.facebook.com/events_manager
- Documentation: https://developers.facebook.com/docs/meta-pixel

**Facebook Catalog:**
- Commerce Manager: https://business.facebook.com/commerce/
- Feed Specs: https://developers.facebook.com/docs/marketing-api/catalog/guides/product-feed
- API Docs: https://developers.facebook.com/docs/marketing-api/catalog

**Instagram Shopping:**
- Setup Guide: https://help.instagram.com/1187859655048322
- Requirements: https://help.instagram.com/1187859655048322

---

## ✅ Testing Checklist

### After Setup:

- [ ] Add GA4 ID in Admin → Settings → SEO Settings
- [ ] Add Facebook Pixel ID in Admin → Settings → SEO Settings
- [ ] Refresh website homepage
- [ ] Check GA4 Real-time report (should see pageview)
- [ ] Install Facebook Pixel Helper extension
- [ ] Verify pixel firing on website (green checkmark)
- [ ] Add product to cart
- [ ] Check both GA4 and Facebook Events Manager for "AddToCart" event
- [ ] Complete a test purchase
- [ ] Verify "Purchase" event in both platforms

---

**Status:** ✅ Analytics Integration Complete - Ready for Production  
**Next:** Setup Facebook Catalog for product publishing  
**Last Updated:** October 21, 2025
