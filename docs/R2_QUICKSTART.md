# 🚀 R2 Migration - Quick Start Guide

## ⚡ TL;DR - Fast Track to Migration

### 1. Setup (5 minutes)
```bash
# Copy environment template
cp .env.r2.example .env

# Edit .env and add your R2 credentials
# Get credentials from: https://dash.cloudflare.com → R2 → Manage API Tokens
```

### 2. Test Connection (1 minute)
```bash
node scripts/test-r2-connection.mjs
```
✅ If this passes, you're ready to migrate!

### 3. Dry Run (2 minutes)
```bash
node scripts/migrate-images-to-r2.mjs --dry-run
```
📋 Review the output to see what will be migrated

### 4. Migrate (30-60 minutes)
```bash
node scripts/migrate-images-to-r2.mjs --batch-size=20
```
☕ Grab a coffee while it migrates ~1000+ images

### 5. Verify (5 minutes)
- Visit your website
- Check product pages load images
- Verify category images display
- Test image variants/swatches

---

## 📝 Required Environment Variables

Add these to your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ACCOUNT_ID=your_32_char_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=product-images
R2_PUBLIC_URL=https://product-images.your-account.r2.dev
```

---

## 🔧 Migration Commands Cheat Sheet

### Test R2 Connection
```bash
node scripts/test-r2-connection.mjs
```
Tests upload, download, verify, delete operations

### Dry Run (No Changes)
```bash
node scripts/migrate-images-to-r2.mjs --dry-run
```
Preview what will happen without making changes

### Migrate Everything
```bash
node scripts/migrate-images-to-r2.mjs --batch-size=20
```
Migrate all product and category images

### Migrate Only Products
```bash
node scripts/migrate-images-to-r2.mjs --products-only --batch-size=20
```
Migrate just product images

### Migrate Only Categories (Test First)
```bash
node scripts/migrate-images-to-r2.mjs --categories-only --batch-size=5
```
Good for testing with smaller dataset

### Small Batch (Conservative)
```bash
node scripts/migrate-images-to-r2.mjs --batch-size=5
```
Slower but safer for testing

---

## 📊 What Gets Migrated

### Current (GitHub)
```
https://raw.githubusercontent.com/kdadks/nirchal/main/public/images/products/image.jpg
```

### After Migration (R2)
```
https://product-images.your-account.r2.dev/products/image.jpg
```

**Database automatically updated** ✅  
**No code changes needed** ✅  
**Zero downtime** ✅

---

## 🔍 Check Migration Status

### View Report
```bash
cat migration-report.json
```

### View Errors (if any)
```bash
cat migration-errors.json
```

---

## ⚠️ If Something Goes Wrong

### Stop Migration
```
Ctrl+C
```
Safe to stop anytime - already migrated images remain working

### Rollback
Both GitHub and R2 URLs work simultaneously:
- No immediate action needed
- Can restore database from Supabase backup
- Or manually update specific images in database

### Re-run Migration
```bash
node scripts/migrate-images-to-r2.mjs
```
Skips already migrated images automatically

---

## ✅ Success Checklist

- [ ] Test script passes ✅
- [ ] Dry run shows expected images ✅
- [ ] Migration completes without errors ✅
- [ ] Website displays all images ✅
- [ ] No broken images on product pages ✅
- [ ] Category images load correctly ✅
- [ ] Image zoom/variants work ✅
- [ ] Admin panel can upload new images ✅

---

## 🎯 Key Files Created

| File | Purpose |
|------|---------|
| `src/utils/r2StorageUtils.ts` | R2 storage operations |
| `scripts/migrate-images-to-r2.mjs` | Migration script |
| `scripts/test-r2-connection.mjs` | Connection test |
| `R2_MIGRATION_GUIDE.md` | Detailed guide |
| `R2_MIGRATION_IMPLEMENTATION_SUMMARY.md` | Technical docs |
| `.env.r2.example` | Environment template |

---

## 💡 Pro Tips

1. **Always test first**: Run test-r2-connection.mjs before migrating
2. **Start small**: Migrate categories first (--categories-only) to test
3. **Monitor progress**: Watch console output during migration
4. **Keep reports**: Save migration-report.json for your records
5. **Don't panic**: Both storage systems work simultaneously during migration

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing env variables" | Check `.env` file exists and has all values |
| "NoSuchBucket" | Create bucket in Cloudflare Dashboard |
| "AccessDenied" | Verify API token has read/write permissions |
| Images not showing | Clear browser cache (Ctrl+Shift+R) |
| Migration slow | Reduce batch size to 5 or 10 |

---

## 🚀 Ready to Deploy?

1. Test on UAT environment first ✅
2. Monitor for 24-48 hours
3. Deploy to production when confident
4. Update admin documentation

---

**Questions?** Check `R2_MIGRATION_GUIDE.md` for detailed explanations!

**Need help?** All scripts have comprehensive error messages to guide you.
