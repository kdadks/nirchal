# 🎯 Quick Command Reference

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## SEO & Marketing Commands

```bash
# Generate XML sitemap for Google
npm run generate-sitemap
# Creates: public/sitemap.xml
# Output: 252 URLs (229 products + 12 categories + 11 static pages)

# Generate product feed for Facebook/Instagram
npm run generate-product-feed
# Creates: public/product-feed.xml
# Output: 229 products in Facebook Catalog format

# Generate both files at once
npm run generate-all
# Run this before each production deployment!
```

---

## When to Run These Commands

### Before Every Deployment
```bash
npm run generate-all
npm run build
```

### After Adding Products
```bash
npm run generate-product-feed
# Then deploy to production
# Facebook auto-syncs daily at 12:00 AM
```

### After Category Changes
```bash
npm run generate-sitemap
# Then deploy to production
# Submit updated sitemap to Google Search Console
```

### Weekly Maintenance
```bash
npm run generate-all
# Keep search engines & social catalogs fresh
```

---

## File Locations

| File | Location | Purpose | Who Uses It |
|------|----------|---------|-------------|
| `sitemap.xml` | `/public/sitemap.xml` | SEO - List of all URLs | Google Search Console |
| `product-feed.xml` | `/public/product-feed.xml` | Product catalog | Facebook/Instagram |
| `robots.txt` | `/public/robots.txt` | Crawler directives | All search engines |
| `.env` | `/.env` | Environment variables | Your app (not deployed) |

---

## Admin Settings Path

After deployment, configure analytics:

```
https://nirchal.com/admin/login
→ Settings
→ SEO Settings Tab
→ Fill in:
   - Google Analytics 4 ID
   - Facebook Pixel ID
   - Instagram Business ID
   - Site Title, Description, Keywords
→ Save Changes
```

---

## Production URLs to Verify

After deployment, check these are accessible:

```
✅ https://nirchal.com/sitemap.xml
✅ https://nirchal.com/product-feed.xml
✅ https://nirchal.com/robots.txt
```

---

## Troubleshooting

**Q: Sitemap not updating?**
```bash
# Regenerate and redeploy
npm run generate-sitemap
npm run build
# Then deploy
```

**Q: Products not showing in Facebook Catalog?**
```bash
# Check feed is accessible
curl https://nirchal.com/product-feed.xml

# Regenerate if needed
npm run generate-product-feed
npm run build
# Then deploy
```

**Q: Need to regenerate everything?**
```bash
npm run generate-all
npm run build
# Then deploy
```

---

## Quick Stats

- **Total Products:** 229 active
- **Total Categories:** 12 active
- **Sitemap URLs:** 252 total
- **Product Feed:** XML format (Facebook spec)
- **Free Shipping:** Yes (included in feed)
- **Currency:** INR (Indian Rupee)
- **Country:** India

---

**Keep this handy for quick reference!** 📌
