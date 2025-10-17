# Git Repository Cleanup Plan

## 🔍 Analysis Results
- **Current repo size**: 831.59 MB
- **Problem**: Product images stored in `public/images/products/` and `public/images/categories/`
- **Impact**: Cloudflare Pages has to clone 831 MB every deployment (extremely slow)

## 📁 Files to Remove from Git History

### Large Product Images (~3MB each):
- `public/images/products/*.jpg`
- `public/images/products/*.png`
- `public/images/categories/*.jpg`

### Identified Large Files:
1. `newly-launched-cranberry-chiffon-saree-with-golden-jarkand-diamond-work-1757526254936.jpg` (3.15 MB)
2. `pure-vichitra-silk-heavy-zari-embroidery-blouse-1757523903972.png` (3.07 MB)
3. `kanjivaram-paithani-saree-a-regal-blend-of-tradition-grace-1757524548488.png` (2.87 MB)
4. `womens-gown-1757606286412.jpg` (2.86 MB)
5. Plus many more...

## ✅ Solution: Move Images to Cloudflare R2 / Supabase Storage

**These images are ALREADY in R2/Supabase Storage!** They don't need to be in Git at all.

## 🚀 Cleanup Steps

### Step 1: Backup Current Repo
```powershell
cd "D:\ITWala Projects"
Copy-Item -Path nirchal -Destination nirchal-backup -Recurse
```

### Step 2: Install git-filter-repo
```powershell
pip install git-filter-repo
```

### Step 3: Remove Images from Git History
```powershell
cd "D:\ITWala Projects\nirchal"

# Remove all product images from history
git filter-repo --path public/images/products/ --invert-paths --force

# Remove all category images from history  
git filter-repo --path public/images/categories/ --invert-paths --force
```

### Step 4: Verify Size Reduction
```powershell
git count-objects -vH
# Expected: size-pack should drop from 831 MB to <50 MB
```

### Step 5: Force Push to GitHub
```powershell
git remote add origin https://github.com/kdadks/nirchal.git
git push --force --all
git push --force --tags
```

### Step 6: Update .gitignore
Add to `.gitignore`:
```
# Product/Category images should be in R2/Supabase, not Git
public/images/products/
public/images/categories/
```

### Step 7: Configure Cloudflare Pages for Shallow Clone
In Cloudflare Pages dashboard:
- Go to Settings → Builds & Deployments
- Add build command: Use shallow clone if possible
- Or use: `git clone --depth=1` in custom build script

## 📊 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| size-pack | 831.59 MB | <50 MB |
| Clone time | 2-5 minutes | <10 seconds |
| Build time | Slow | Fast ✅ |

## ⚠️ Important Notes

1. **Your images are safe** - they're already in R2/Supabase Storage
2. **Code references images via URLs** - no code changes needed
3. **Team needs to re-clone** - after force push, collaborators should:
   ```powershell
   cd "D:\ITWala Projects"
   Remove-Item nirchal -Recurse -Force
   git clone https://github.com/kdadks/nirchal.git
   ```

## 🎯 Alternative: Quick Fix for Immediate Deployment

If you need to deploy NOW without cleanup:

### Option A: Deploy only dist folder
```powershell
npm run build
npx wrangler pages deploy dist --project-name=nirchal
```

### Option B: Use .cfignore
Create `.cfignore`:
```
public/images/products/
public/images/categories/
node_modules/
.git/
*.log
```

This won't fix the clone time, but will speed up the upload.

## 📝 Checklist

- [ ] Backup repo
- [ ] Install git-filter-repo
- [ ] Run filter-repo commands
- [ ] Verify size reduction
- [ ] Update .gitignore
- [ ] Force push to GitHub
- [ ] Test Cloudflare Pages deployment
- [ ] Notify team to re-clone (if applicable)
