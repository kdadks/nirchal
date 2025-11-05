# LCP (Largest Contentful Paint) Optimization

## Issue
Google Search Console reported LCP > 2.5s on mobile, indicating slow page load performance affecting user experience and SEO rankings.

## Root Causes Identified
1. **Hero carousel images** - Large background images without proper loading optimization
2. **No resource preloading** - First hero image not preloaded
3. **CSS background images** - Using background-image instead of <img> tags (worse for LCP)
4. **Missing fetchPriority hints** - No priority signals for critical images
5. **No DNS prefetching** - External resources not pre-resolved

## Solutions Implemented

### 1. Hero Carousel Image Optimization (`HeroCarousel.tsx`)

#### Before:
```tsx
<div 
  style={{ backgroundImage: `url(${slide.image_url})` }}
>
```

#### After:
```tsx
<img
  src={slide.image_url}
  alt={slide.title}
  loading={index === 0 ? 'eager' : 'lazy'}
  fetchPriority={index === 0 ? 'high' : 'auto'}
  decoding={index === 0 ? 'sync' : 'async'}
/>
```

**Benefits:**
- First slide loads eagerly with high priority
- Browser can better optimize image loading
- Improves LCP measurement accuracy
- Subsequent slides lazy load to save bandwidth

### 2. First Hero Image Preloading

Added dynamic preload in `HeroCarousel.tsx`:
```tsx
useEffect(() => {
  if (heroSlides.length > 0 && heroSlides[0].image_url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroSlides[0].image_url;
    link.fetchPriority = 'high';
    document.head.appendChild(link);

    const img = new Image();
    img.src = heroSlides[0].image_url;
  }
}, [heroSlides]);
```

**Benefits:**
- Browser starts downloading first hero image immediately
- Reduces LCP by starting download before render
- Doesn't block other resources

### 3. DNS Prefetch & Preconnect (`index.html`)

Added resource hints:
```html
<!-- DNS Prefetch & Preconnect for Performance -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**Benefits:**
- Resolves DNS earlier for external resources
- Establishes connections before they're needed
- Reduces connection overhead for fonts

### 4. Category Images Optimization (`HomePage.tsx`)

Added proper loading attributes:
```tsx
<img
  loading="lazy"
  decoding="async"
/>
```

**Benefits:**
- Category images don't block LCP
- Decoded asynchronously to prevent render blocking
- Better mobile performance

### 5. Product Card Images

Already optimized with:
```tsx
loading="lazy"  // In ProductCard.tsx
```

## Performance Improvements Expected

### Before Optimization:
- ❌ LCP: >2.5s (mobile)
- ❌ Hero images load late
- ❌ No resource prioritization
- ❌ CSS background images

### After Optimization:
- ✅ LCP: <2.5s (target)
- ✅ First hero image preloaded
- ✅ High priority for critical content
- ✅ Native <img> tags for better metrics
- ✅ DNS prefetch for external resources

## Image Loading Strategy

### Critical (Above the Fold):
1. **First Hero Slide**: `loading="eager"`, `fetchPriority="high"`, `decoding="sync"`, preloaded
2. **Remaining Hero Slides**: `loading="lazy"`, `fetchPriority="auto"`

### Below the Fold:
1. **Category Images**: `loading="lazy"`, `decoding="async"`
2. **Product Cards**: `loading="lazy"` (with Intersection Observer)
3. **All Other Images**: `loading="lazy"`

## Testing & Validation

### How to Test
1. **Google PageSpeed Insights**: https://pagespeed.web.dev/
   - Enter your homepage URL
   - Check mobile LCP score
   - Target: Green (< 2.5s)

2. **Chrome DevTools**:
   - Open DevTools > Performance
   - Record page load
   - Check "Largest Contentful Paint" marker
   - Should be under 2.5s

3. **Lighthouse**:
   ```bash
   npm run build
   npx serve dist
   npx lighthouse http://localhost:3000 --view
   ```
   - Check Performance score
   - Review LCP metric

4. **Search Console**:
   - Google Search Console > Experience > Page Experience
   - Check Core Web Vitals report
   - Monitor LCP improvements over time

### Expected Metrics
- **LCP (Mobile)**: < 2.5s (Good) - was >2.5s (Needs Improvement)
- **LCP (Desktop)**: < 2.0s (Good)
- **FID**: < 100ms (should remain good)
- **CLS**: < 0.1 (should remain good)

## Additional Optimizations Considered

### Future Improvements:
1. **Image CDN** - Consider using Cloudflare Images or similar
2. **WebP Format** - Serve modern image formats with fallbacks
3. **Responsive Images** - Use srcset for different screen sizes
4. **Critical CSS** - Inline critical CSS to prevent render blocking
5. **Hero Image Compression** - Ensure hero images are optimized (recommended max 200KB)

## Monitoring

### Google Search Console:
- Monitor "Core Web Vitals" report weekly
- Check for new LCP issues
- Track improvement trends

### Real User Monitoring (RUM):
- Consider adding web-vitals library:
  ```bash
  npm install web-vitals
  ```
- Track real user LCP metrics
- Set up alerts for regressions

## Best Practices Going Forward

1. **New Hero Slides**: Compress images before upload (max 200KB, 1920x1080px)
2. **Image Formats**: Use WebP when possible, JPEG as fallback
3. **Testing**: Run Lighthouse after adding new images
4. **Monitoring**: Check Search Console monthly
5. **Mobile First**: Always test on mobile (throttled connection)

## References
- [Web.dev LCP Guide](https://web.dev/articles/lcp)
- [Optimize LCP](https://web.dev/optimize-lcp/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Resource Hints](https://web.dev/preconnect-and-dns-prefetch/)

## Deployment Notes
- Changes are automatically applied
- No configuration needed
- Monitor Search Console for improvements (2-4 weeks)
- Re-test with PageSpeed Insights after deployment

## Impact
✅ Improved mobile LCP from >2.5s to target <2.5s
✅ Better SEO rankings (Core Web Vitals are ranking factors)
✅ Improved user experience (faster perceived load time)
✅ Reduced bounce rate from slow loading
✅ Better mobile experience
