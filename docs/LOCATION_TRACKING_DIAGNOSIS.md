# Location Tracking - Diagnosis & Solutions

## Why Location is Not Being Tracked

### Root Causes:

#### 1. **Running on Localhost** ⚠️ (Most Common)
- **File**: `src/hooks/useVisitorTracking.ts` (line 137-141)
- **Issue**: Visitor tracking is **intentionally disabled** on localhost to prevent polluting analytics during development
- **Affected hostnames**:
  - `localhost`
  - `127.0.0.1`
  - `[::1]` (IPv6 localhost)
  - `192.168.x.x` (local network)
  - `10.x.x.x` (private network)
  - `*.local` domains

**Solution**: Deploy to a production URL or development server with a public IP address

---

#### 2. **IP Geolocation API Rate Limit Exceeded**
- **API**: ipapi.co (Free Tier)
- **Limit**: 1,000 requests per day
- **Reset**: Midnight UTC
- **File**: `src/hooks/useVisitorTracking.ts` (line 112-129)

**Solution**: 
- Wait for API limit to reset at midnight UTC
- Upgrade to a paid tier if you exceed 1,000 unique visitors/day
- Consider using MaxMind GeoIP2 or ipgeolocation.io

---

#### 3. **Network Request Failed**
- The API might fail due to:
  - Network connectivity issues
  - CORS restrictions (unlikely with ipapi.co)
  - Timeout
- **Behavior**: Location silently fails, visitor is still tracked without location data

**Solution**: Check browser console for network errors

---

#### 4. **IP Address Excluded from Tracking**
- **File**: `src/hooks/useVisitorTracking.ts` (line 93)
- **Excluded IPs**: 
  - `192.168.0.199` (Admin machine - currently configured)

**Solution**: Remove your IP from the exclusion list if needed, or add it back if you want to exclude it

---

## How Location Tracking Works

### Flow Diagram:
```
Visitor Lands on Site
         ↓
Is it localhost? → YES → Skip tracking, exit
         ↓ NO
Fetch IP & Location from ipapi.co
         ↓
Location API Success?
         ↓ YES        ↓ NO
Check if IP         Create VisitorInfo
is excluded?        without location
         ↓                 ↓
IP Excluded?     Continue with
    ↓ YES         tracking (no location)
   Exit            ↓
    ↓ NO      Check if visitor
Continue      exists in DB
with location  ↓
   ↓      Exists?
Insert/Update    ↓ YES → Update with location
with location    ↓ NO → Insert new visitor with location
data
```

### Key Points:
✅ Location is fetched **asynchronously** before tracking  
✅ Tracking continues **even if location fails** (graceful fallback)  
✅ Location data is **stored but not displayed to users** (privacy)  
✅ Each visitor is tracked **only once per session** (cached in cookie)  

---

## Testing Location Tracking

### 1. Test on Production URL
```bash
# Deploy your app to a public URL
# Visit it from a browser (not localhost)
# Check admin > Guest Visitors page
```

### 2. Check Browser Console
```javascript
// Open DevTools → Console
// You should see:
// "Fetching location data from ipapi.co..."
// OR
// "Visitor tracking disabled on localhost"
```

### 3. Monitor API Calls
Open DevTools → Network tab → Look for requests to:
- `https://ipapi.co/json/` (should return 200)

### 4. Check Database
Query the database directly:
```sql
SELECT id, visitor_id, city, country, ip_address 
FROM guest_visitors 
WHERE city IS NOT NULL OR country IS NOT NULL
LIMIT 10;
```

---

## Configuration

### Admin Machine Exclusion
**File**: `src/hooks/useVisitorTracking.ts` (line 93)
```typescript
const EXCLUDED_IP_ADDRESSES = [
  '192.168.0.199', // Admin machine
];
```

**To add more IPs**:
1. Find your public IP: Visit https://ipapi.co/json/ or Google "my IP"
2. Add to `EXCLUDED_IP_ADDRESSES` array
3. Rebuild the app

---

## Alternative Geolocation Services

| Service | Free Tier | Rate Limit | Accuracy | Setup |
|---------|-----------|-----------|----------|-------|
| **ipapi.co** (Current) | ✅ Yes | 1,000/day | City-level | No auth |
| **ipgeolocation.io** | ✅ Yes | 30,000/day | City-level | API key needed |
| **MaxMind GeoIP2** | ❌ No | Unlimited | City-level | License ($$ ) |
| **ip-api.com** | ✅ Yes | 45/min | City-level | No auth |

---

## Common Issues & Solutions

### Issue: "Unknown" shows in location list
**Cause**: Visitors from IPs that don't have location data (localhost, VPN, proxies)  
**Solution**: Already fixed in the UI - Unknown locations are now filtered out

### Issue: Only 10 locations showing
**Cause**: Top 8 locations are shown by design  
**Solution**: Normal behavior to keep dashboard clean

### Issue: Location is NULL in database
**Causes**:
- Visitor accessed from localhost
- API failed to fetch location
- Visitor is from an excluded IP

**Solution**: Check if conditions above apply, deploy to production

### Issue: Getting rate limited
**Cause**: More than 1,000 unique visitors per day  
**Solution**: 
- Upgrade to paid ipapi.co plan
- Switch to ipgeolocation.io (30,000/day free)
- Cache location data for known IPs

---

## Next Steps to Enable Location Tracking

### If you're on localhost:
1. Deploy your app to a **public URL**
2. Get a domain name or use Ngrok: `ngrok http 5173`
3. Visit your public URL (not localhost)
4. Check admin > Guest Visitors page

### If API is rate-limited:
1. **Option A**: Wait until tomorrow (API resets at midnight UTC)
2. **Option B**: Upgrade ipapi.co to paid tier
3. **Option C**: Switch to ipgeolocation.io

### If you need more accurate location:
1. Upgrade to MaxMind GeoIP2 (paid, most accurate)
2. Or use ipgeolocation.io (free, 30,000/day limit)

---

## Files Related to Location Tracking

| File | Purpose |
|------|---------|
| `src/hooks/useVisitorTracking.ts` | Main tracking logic, location fetching |
| `src/pages/admin/GuestVisitorsPage.tsx` | Admin display, pie chart, filtering |
| `docs/LOCATION_TRACKING_IMPLEMENTATION.md` | Original implementation notes |
| `supabase/migrations/add_location_to_guest_visitors.sql` | Database schema |

---

## Summary

**Location tracking is working, but shows as "Unknown" because:**

1. ✅ **Most visitors are from localhost** → Intentionally not tracked
2. ✅ **API limit might be exceeded** → Wait for reset or upgrade
3. ✅ **Some IPs don't have location data** → Normal for VPN/proxies

**To test properly:**
- Deploy to a **public URL** (not localhost)
- Visit from a **real browser with public IP**
- Check the **admin > Guest Visitors** page
- Look for location in the pie chart

