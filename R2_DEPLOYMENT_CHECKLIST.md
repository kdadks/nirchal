# 📋 R2 Migration Deployment Checklist

## Pre-Migration Phase

### Environment Setup
- [ ] **Create R2 Bucket**
  - Bucket name: `product-images`
  - Region: Auto
  - Status: ✅ Already created

- [ ] **Generate R2 API Token**
  - Go to: https://dash.cloudflare.com → R2 → Manage API Tokens
  - Click: "Create API Token"
  - Name: "Image Migration Token"
  - Permissions: ✅ Object Read & Write
  - Save: Access Key ID and Secret Access Key

- [ ] **Enable Public Access on R2 Bucket**
  - Go to: R2 → product-images → Settings
  - Enable: "Public Access"
  - Note: Public URL (e.g., `https://product-images.ACCOUNT_ID.r2.dev`)
  - Optional: Set up custom domain

- [ ] **Configure Environment Variables**
  - Copy `.env.r2.example` to `.env`
  - Fill in all R2 credentials:
    - `R2_ACCOUNT_ID`
    - `R2_ACCESS_KEY_ID`
    - `R2_SECRET_ACCESS_KEY`
    - `R2_BUCKET_NAME`
    - `R2_PUBLIC_URL`
  - Fill in Supabase credentials:
    - `VITE_SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY` (required for migration)

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```
  - Verify @aws-sdk/client-s3 is installed
  - Verify @aws-sdk/s3-request-presigner is installed

### Testing Phase

- [ ] **Test R2 Connection**
  ```bash
  node scripts/test-r2-connection.mjs
  ```
  - [ ] Environment variables validated
  - [ ] R2 client initialized
  - [ ] Test file uploaded successfully
  - [ ] Upload verified
  - [ ] Public URL accessible
  - [ ] Test file deleted

- [ ] **Review Current Images**
  - Product images count: ~1000+ files
  - Category images count: ~10-20 files
  - Total estimated size: 200-500 MB
  - Storage location: `public/images/products/`, `public/images/categories/`

## Migration Phase

### Dry Run Testing

- [ ] **Run Dry Run - Categories Only**
  ```bash
  node scripts/migrate-images-to-r2.mjs --dry-run --categories-only
  ```
  - [ ] Correct number of images detected
  - [ ] Image URLs look correct
  - [ ] No unexpected errors

- [ ] **Run Dry Run - Products Only**
  ```bash
  node scripts/migrate-images-to-r2.mjs --dry-run --products-only --batch-size=10
  ```
  - [ ] Correct number of images detected
  - [ ] Batch processing working
  - [ ] Progress logging clear

- [ ] **Review Dry Run Output**
  - [ ] All GitHub URLs detected correctly
  - [ ] No duplicate migrations
  - [ ] Expected number matches database count

### Live Migration - Categories First

- [ ] **Migrate Categories (Small Test)**
  ```bash
  node scripts/migrate-images-to-r2.mjs --categories-only --batch-size=5
  ```
  - [ ] Migration starts successfully
  - [ ] Progress shown in console
  - [ ] Batch processing working
  - [ ] No errors during upload
  - [ ] Database updates successful

- [ ] **Verify Category Images**
  - [ ] Visit website categories page
  - [ ] All category images display
  - [ ] Images load quickly
  - [ ] No broken images
  - [ ] URLs point to R2

- [ ] **Review Category Migration Report**
  ```bash
  cat migration-report.json
  ```
  - [ ] All categories successful
  - [ ] Zero failures
  - [ ] Timing acceptable

### Live Migration - Products

- [ ] **Migrate Products in Batches**
  ```bash
  node scripts/migrate-images-to-r2.mjs --products-only --batch-size=20
  ```
  - [ ] Migration starts successfully
  - [ ] Progress updates visible
  - [ ] Error handling working
  - [ ] No connection timeouts
  - [ ] Database updates atomic

- [ ] **Monitor Migration Progress**
  - [ ] Console output clear and informative
  - [ ] Batch numbers incrementing
  - [ ] Success rate high (>95%)
  - [ ] No repeated errors

- [ ] **Review Final Report**
  ```bash
  cat migration-report.json
  ```
  - [ ] Total images migrated: ~1000+
  - [ ] Success rate: >95%
  - [ ] Total duration: 30-60 minutes
  - [ ] Errors logged (if any)

- [ ] **Check Error Log (if applicable)**
  ```bash
  cat migration-errors.json
  ```
  - [ ] Review any failed migrations
  - [ ] Identify patterns in errors
  - [ ] Plan retry strategy

## Post-Migration Verification

### Website Testing

- [ ] **Clear Browser Cache**
  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
  - Clear site data if needed

- [ ] **Test Product Pages**
  - [ ] Home page products display
  - [ ] Product listing pages load images
  - [ ] Individual product pages work
  - [ ] Product image zoom functional
  - [ ] No broken images anywhere

- [ ] **Test Product Variants**
  - [ ] Swatch images display
  - [ ] Variant selection works
  - [ ] Color/size images load
  - [ ] Variant image switching smooth

- [ ] **Test Categories**
  - [ ] Category listing shows images
  - [ ] Category cards display correctly
  - [ ] Category pages load properly
  - [ ] Navigation categories work

- [ ] **Test Image Loading**
  - [ ] Images load quickly
  - [ ] Lazy loading works
  - [ ] No CORS errors in console
  - [ ] No 404 errors in network tab

- [ ] **Test Different Devices**
  - [ ] Desktop browser
  - [ ] Mobile responsive view
  - [ ] Tablet view
  - [ ] Different browsers (Chrome, Firefox, Safari)

### Performance Verification

- [ ] **Check Load Times**
  - [ ] Page load time improved or same
  - [ ] Image load time faster
  - [ ] Time to first paint acceptable
  - [ ] Largest contentful paint good

- [ ] **Check CDN Performance**
  - [ ] Images served from Cloudflare edge
  - [ ] Cache headers correct (1 year)
  - [ ] Browser caching working
  - [ ] No unnecessary re-downloads

### Database Verification

- [ ] **Verify Database Updates**
  ```sql
  -- Check product_images table
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN image_url LIKE '%r2.dev%' OR image_url LIKE '%r2.cloudflarestorage%' THEN 1 END) as r2_images,
    COUNT(CASE WHEN image_url LIKE '%github%' THEN 1 END) as github_images
  FROM product_images;
  ```
  - [ ] R2 images count matches migration report
  - [ ] No remaining GitHub URLs (or expected number)

- [ ] **Check Categories Table**
  ```sql
  SELECT id, name, image_url
  FROM categories
  WHERE image_url IS NOT NULL;
  ```
  - [ ] All category URLs updated to R2
  - [ ] URLs are valid and accessible

### Admin Panel Testing

- [ ] **Test Image Upload**
  - [ ] Create test product
  - [ ] Upload new product image
  - [ ] Image saves successfully
  - [ ] Image displays in admin
  - [ ] Image displays on frontend

- [ ] **Test Image Delete**
  - [ ] Delete test image
  - [ ] Image removed from storage
  - [ ] Database updated
  - [ ] No orphaned files

- [ ] **Test Bulk Operations**
  - [ ] Bulk product import works
  - [ ] Multiple images upload
  - [ ] Variant images handled

## Cloudflare Pages Deployment

### Environment Configuration

- [ ] **Add Environment Variables to Cloudflare Pages**
  - Go to: Cloudflare Pages → Your Project → Settings → Environment Variables
  - Add for Production:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_R2_ACCOUNT_ID`
    - `VITE_R2_ACCESS_KEY_ID`
    - `VITE_R2_SECRET_ACCESS_KEY`
    - `VITE_R2_BUCKET_NAME`
    - `VITE_R2_PUBLIC_URL`
  - Add for Preview (UAT):
    - Same variables as production

- [ ] **Configure Build Settings**
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Root directory: `/`
  - Node version: 18 or higher

### Deployment

- [ ] **Deploy UAT Branch**
  ```bash
  git add .
  git commit -m "Add R2 storage migration"
  git push origin uat
  ```
  - [ ] Cloudflare Pages triggers build
  - [ ] Build completes successfully
  - [ ] No build errors
  - [ ] Deployment successful

- [ ] **Test UAT Deployment**
  - Visit: https://your-uat-url.pages.dev
  - [ ] Website loads correctly
  - [ ] Images display from R2
  - [ ] No console errors
  - [ ] All features working

- [ ] **Monitor UAT for 24-48 Hours**
  - [ ] No image loading issues
  - [ ] Performance stable
  - [ ] No user complaints
  - [ ] Error logs clean

## Production Deployment

### Pre-Production

- [ ] **Backup Database**
  - Use Supabase point-in-time recovery
  - Or export database backup
  - Store backup safely

- [ ] **Verify UAT Success**
  - [ ] No issues reported in UAT
  - [ ] Performance acceptable
  - [ ] All tests passed
  - [ ] Team approval obtained

### Deploy to Production

- [ ] **Merge to Main Branch**
  ```bash
  git checkout main
  git merge uat
  git push origin main
  ```
  - [ ] Cloudflare Pages triggers production build
  - [ ] Build completes successfully
  - [ ] Deployment successful

- [ ] **Monitor Production Deployment**
  - [ ] Website loads correctly
  - [ ] Images display properly
  - [ ] No errors in console
  - [ ] Traffic normal

### Post-Deployment Monitoring

- [ ] **Monitor First Hour**
  - [ ] Check website every 5-10 minutes
  - [ ] Monitor Cloudflare R2 analytics
  - [ ] Watch for error spikes
  - [ ] User feedback

- [ ] **Monitor First Day**
  - [ ] Check throughout the day
  - [ ] Review R2 bandwidth usage
  - [ ] Check load times
  - [ ] Verify caching working

- [ ] **Monitor First Week**
  - [ ] Daily health checks
  - [ ] Review R2 costs
  - [ ] Performance metrics
  - [ ] User satisfaction

## Cleanup (Optional)

### After 1-2 Weeks in Production

- [ ] **Backup GitHub Images**
  - Create archive of `public/images/` folder
  - Store backup safely (Google Drive, S3, etc.)
  - Verify backup integrity

- [ ] **Delete GitHub Images (Optional)**
  - Remove `public/images/products/` (migrated files)
  - Remove `public/images/categories/` (migrated files)
  - Keep folder structure for reference
  - Commit and push changes

- [ ] **Clean Up Scripts**
  - Keep migration scripts for documentation
  - Remove test files
  - Archive migration reports

## Rollback Procedure (If Needed)

### Emergency Rollback

- [ ] **Stop Further Changes**
  - Halt any ongoing processes
  - Communicate to team

- [ ] **Restore Database**
  - Use Supabase point-in-time recovery
  - Or restore from backup
  - Verify restoration successful

- [ ] **Revert Code Changes**
  ```bash
  git revert <migration-commit-hash>
  git push origin main
  ```

- [ ] **Verify Rollback**
  - Website using GitHub images again
  - No broken images
  - All features working

## Success Metrics

### Performance Metrics
- [ ] Page load time: Same or better
- [ ] Image load time: 20-50% faster
- [ ] CDN cache hit rate: >90%
- [ ] Zero 404 errors

### Business Metrics
- [ ] Zero downtime during migration
- [ ] No user complaints
- [ ] No impact on sales
- [ ] Admin workflow unchanged

### Technical Metrics
- [ ] Migration success rate: >95%
- [ ] Database integrity: 100%
- [ ] R2 bucket size: Expected range
- [ ] Cost within budget

## Documentation

- [ ] **Update README**
  - Document new storage system
  - Update setup instructions
  - Add R2 configuration steps

- [ ] **Update Admin Guide**
  - Explain new image upload flow
  - Document any UI changes
  - Provide troubleshooting tips

- [ ] **Archive Migration Docs**
  - Keep migration scripts
  - Store migration reports
  - Document lessons learned

## Sign-Off

- [ ] **Technical Lead Approval**
  - Migration successful
  - All tests passed
  - Performance acceptable

- [ ] **Product Owner Approval**
  - User experience maintained
  - No feature regression
  - Business requirements met

- [ ] **Operations Team Approval**
  - Monitoring in place
  - Runbooks updated
  - Support team trained

---

## 🎉 Migration Complete!

Congratulations! Your images are now hosted on Cloudflare R2 with:
- ⚡ Faster load times
- 💰 Zero egress fees
- 📈 Better scalability
- 🌍 Global CDN delivery

**Total Migration Time**: ~2-3 hours  
**User Impact**: Zero downtime  
**Performance Improvement**: Significant ✅
