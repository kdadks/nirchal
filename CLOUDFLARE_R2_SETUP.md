# Cloudflare Pages R2 Configuration Guide

## Overview
This project uses **Cloudflare Pages** with **Cloudflare Functions** (not Netlify Functions) to handle image uploads to R2 storage.

## Important: Cloudflare Functions vs Netlify Functions

**Current Setup:**
- ✅ Deployed on: **Cloudflare Pages** (https://nirchal.pages.dev/)
- ✅ Functions: **Cloudflare Functions** (`/functions/*` directory)
- ❌ Netlify Functions (`/netlify/functions/*`) - **NOT COMPATIBLE** with Cloudflare Pages

## R2 Bucket Binding Setup

### Step 1: Configure R2 Bucket Binding in Cloudflare Pages

1. Go to **Cloudflare Dashboard** → **Pages** → **nirchal project**
2. Navigate to **Settings** → **Functions**
3. Scroll to **R2 bucket bindings**
4. Click **Add binding**
5. Configure:
   - **Variable name**: `PRODUCT_IMAGES`
   - **R2 bucket**: `product-images`
6. Click **Save**

### Step 2: Configure Environment Variables

Go to **Settings** → **Environment variables** and add:

```
R2_PUBLIC_URL=https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev
```

**Note:** You do NOT need to set R2 credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY) when using R2 bucket bindings. The binding handles authentication automatically.

### Step 3: Deploy

The Cloudflare Functions will automatically deploy when you push to GitHub (if connected via Git) or when you deploy manually.

## Function Endpoints

After deployment, these endpoints will be available:

- **Upload**: `https://nirchal.pages.dev/upload-image-r2` (POST)
- **Delete**: `https://nirchal.pages.dev/delete-image-r2` (DELETE)

## Function Structure

### Cloudflare Functions (Current - ✅ Working)

```
/functions/
  ├── upload-image-r2.ts    # POST handler for uploads
  └── delete-image-r2.ts    # DELETE handler for deletions
```

- Uses Cloudflare's `onRequestPost`, `onRequestDelete`, `onRequestOptions` exports
- Direct R2 bucket access via `env.PRODUCT_IMAGES` binding
- No AWS SDK needed - uses native R2 API

### Netlify Functions (Old - ❌ Not Compatible)

```
/netlify/functions/
  ├── upload-image-r2.ts    # NOT USED on Cloudflare Pages
  └── delete-image-r2.ts    # NOT USED on Cloudflare Pages
```

**These files can be deleted** - they won't work on Cloudflare Pages.

## API Usage

### Upload Image (POST /upload-image-r2)

```typescript
const response = await fetch('/upload-image-r2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'product-123.jpg',
    folder: 'products', // or 'categories'
    imageData: 'data:image/jpeg;base64,/9j/4AAQ...',
    contentType: 'image/jpeg'
  })
});

const result = await response.json();
// { success: true, url: 'https://pub-xxx.r2.dev/products/product-123.jpg' }
```

### Delete Image (DELETE /delete-image-r2)

```typescript
const response = await fetch('/delete-image-r2', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'product-123.jpg',
    folder: 'products'
  })
});

const result = await response.json();
// { success: true }
```

## Local Development

### Option 1: Use Cloudflare Wrangler (Recommended)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Run local dev server with R2 bindings
wrangler pages dev dist --r2 PRODUCT_IMAGES=product-images
```

### Option 2: Test on Deployed Environment

Since R2 bindings require Cloudflare infrastructure, the easiest way to test is on the deployed site:

- Production: https://nirchal.pages.dev/
- Preview deployments: Automatic on PR branches

### Option 3: Mock for Local Dev (Current)

The current setup shows a helpful error message when functions aren't available locally:

```
Upload function not available. In local dev, use 'netlify dev' instead of 'npm run dev'.
Or test uploads on deployed environment: https://nirchal.pages.dev/
```

## Troubleshooting

### 405 Method Not Allowed

**Cause**: Function exists but doesn't accept the HTTP method
**Solution**: 
- Ensure you're using POST for uploads, DELETE for deletes
- Check CORS preflight (OPTIONS) is handled

### 404 Not Found

**Cause**: Function not deployed or wrong path
**Solution**:
- Verify functions are in `/functions/` directory (not `/netlify/functions/`)
- Check Cloudflare Pages build logs
- Ensure files have proper exports (`onRequestPost`, etc.)

### R2 Binding Not Working

**Cause**: R2 bucket binding not configured in Cloudflare Pages
**Solution**:
- Go to Pages Settings → Functions → R2 bucket bindings
- Add binding: `PRODUCT_IMAGES` → `product-images`
- Redeploy

### Images Not Displaying

**Cause**: R2 bucket not publicly accessible or wrong URL
**Solution**:
- Verify R2 bucket has public access enabled
- Check `R2_PUBLIC_URL` environment variable
- Test URL directly: `https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev/products/test.jpg`

## Migration Notes

### Why Cloudflare Functions?

1. **Native Integration**: Direct R2 access without AWS SDK
2. **Performance**: Edge functions run close to users
3. **Security**: No credentials in code - bindings handle auth
4. **Cost**: Free tier includes 100,000 requests/day
5. **Compatibility**: Designed for Cloudflare Pages deployment

### Differences from Netlify Functions

| Feature | Netlify Functions | Cloudflare Functions |
|---------|-------------------|---------------------|
| Export Format | `export const handler = ...` | `export async function onRequestPost(...)` |
| Request Object | `event.body`, `event.httpMethod` | `request.json()`, `request.method` |
| Response Format | `{ statusCode, headers, body }` | `new Response(body, { status, headers })` |
| R2 Access | AWS SDK required | Native R2 binding |
| Environment | Node.js runtime | V8 Isolates (faster) |

## Next Steps

1. ✅ Commit and push new Cloudflare Functions
2. ✅ Configure R2 bucket binding in Cloudflare Pages dashboard
3. ✅ Verify environment variables
4. ✅ Deploy and test uploads
5. 🗑️ (Optional) Delete old `/netlify/functions/` directory

## References

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [R2 Bucket Bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
- [Cloudflare Workers Types](https://github.com/cloudflare/workers-types)
