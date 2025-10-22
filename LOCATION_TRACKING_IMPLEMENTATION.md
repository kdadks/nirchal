# Guest Visitor Location Tracking Implementation

## Overview
Enhanced the guest visitor tracking system to capture and display geographic location information (city, country) based on IP address, with localhost exclusion to avoid tracking development visits.

## Features Implemented

### 1. **Localhost Exclusion**
- Automatically detects and excludes tracking from:
  - localhost
  - 127.0.0.1
  - [::1] (IPv6 localhost)
  - 192.168.x.x (local network)
  - 10.x.x.x (private network)
  - *.local domains

### 2. **IP Geolocation**
- Integrated with ipapi.co API for free IP geolocation
- API Limits: 1,000 requests per day (free tier)
- Captures the following location data:
  - IP Address
  - City
  - Country & Country Code (ISO 3166-1 alpha-2)
  - Region/State
  - Latitude & Longitude

### 3. **Database Schema**
Added location fields to `guest_visitors` table:
- `ip_address` VARCHAR(45) - Supports IPv4 and IPv6
- `city` VARCHAR(100)
- `country` VARCHAR(100)
- `country_code` VARCHAR(2)
- `region` VARCHAR(100)
- `latitude` DECIMAL(10, 8)
- `longitude` DECIMAL(11, 8)

**Indexes created:**
- `idx_guest_visitors_ip_address` - For faster IP lookups
- `idx_guest_visitors_country` - For country-based analytics

### 4. **Admin Dashboard Display**
Guest Visitors page now shows:
- 📍 City, Country (if available)
- Falls back gracefully if location data is not available

## Files Modified

### `src/hooks/useVisitorTracking.ts`
- Added `LocationInfo` interface with all location fields
- Added `isLocalhost()` function to detect local environments
- Added `fetchLocationData()` async function using ipapi.co
- Refactored tracking logic into `initTracking()` async function
- Location data now fetched before visitor tracking
- Both insert and update operations include location data

### `src/pages/admin/GuestVisitorsPage.tsx`
- Updated `GuestVisitor` interface to include location fields
- Modified Supabase query to select location columns
- Added location display with pin emoji (📍)
- Format: "City, Country" shown under device info

### `supabase/migrations/add_location_to_guest_visitors.sql`
- Migration file to add all location columns
- Includes proper data types for IPv6 support
- Adds performance indexes
- Includes column documentation comments

## Migration Instructions

### Step 1: Run Database Migration
Execute the migration in Supabase:

```bash
# Option A: Via Supabase Dashboard
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of supabase/migrations/add_location_to_guest_visitors.sql
3. Execute the SQL

# Option B: Via Supabase CLI (if configured)
supabase db push
```

### Step 2: Verify Migration
Check that the columns were added:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'guest_visitors' 
AND column_name IN ('ip_address', 'city', 'country', 'country_code', 'region', 'latitude', 'longitude');
```

### Step 3: Test Location Tracking
1. Clear your browser cookies for the site
2. Visit the site from a non-localhost address
3. Check the Guest Visitors admin page
4. Verify location data appears (📍 City, Country)

## Technical Details

### Async Flow
The tracking system now follows this flow:
1. Check if localhost → Exit early if true
2. Get/create visitor ID from cookie
3. Fetch location data from ipapi.co (async)
4. Detect browser, OS, device type
5. Check if visitor exists in database
6. Insert new visitor OR update existing visitor with location data

### Privacy Considerations
- IP addresses are stored but not displayed in admin UI
- Location data is approximate (city-level, not precise)
- Localhost and private networks are excluded from tracking
- No personally identifiable information (PII) is collected
- Cookie-based tracking with 365-day expiry

### API Rate Limits
**ipapi.co Free Tier:**
- 1,000 requests per day
- No API key required for free tier
- Rate limit resets at midnight UTC

**Best Practices:**
- Location is fetched once per visitor per session
- Subsequent page views reuse existing visitor data
- Consider upgrading to paid tier if traffic exceeds 1,000 unique visitors/day

## Error Handling
The system gracefully handles failures:
- If ipapi.co API fails → Visitor tracked without location data
- If location fields don't exist → Silent fail, tracking continues
- If database insert fails → Error logged, no user impact
- Network errors → Visitor tracking completes without location

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Verify columns exist in guest_visitors table
- [ ] Test localhost exclusion (visit from localhost, no tracking)
- [ ] Test location tracking (visit from external IP)
- [ ] Check location appears in Guest Visitors page
- [ ] Verify existing visitors don't break
- [ ] Test with VPN/different locations
- [ ] Confirm no errors in browser console

## Future Enhancements

Potential improvements:
1. **Location Analytics Dashboard**
   - Map visualization of visitor locations
   - Country/city breakdown charts
   - Regional traffic insights

2. **Advanced Filtering**
   - Filter visitors by country
   - Filter by city
   - Time-based location trends

3. **IP Geolocation Caching**
   - Cache location data for known IPs
   - Reduce API calls for repeat visitors
   - Store location data in separate table

4. **Alternative Geolocation Services**
   - MaxMind GeoIP2 (more accurate, requires license)
   - ipgeolocation.io (higher rate limits)
   - Self-hosted GeoIP database

## Related Files
- `src/hooks/useVisitorTracking.ts` - Main tracking logic
- `src/pages/admin/GuestVisitorsPage.tsx` - Admin display
- `supabase/migrations/add_location_to_guest_visitors.sql` - Database schema
- `src/config/supabase.ts` - Database connection

## API Reference

### ipapi.co API
**Endpoint:** `https://ipapi.co/json/`

**Response Example:**
```json
{
  "ip": "8.8.8.8",
  "city": "Mountain View",
  "region": "California",
  "country": "US",
  "country_name": "United States",
  "latitude": 37.4056,
  "longitude": -122.0775
}
```

**Documentation:** https://ipapi.co/api/

---

**Implementation Status:** ✅ Complete - Ready for deployment
**Database Migration:** ⚠️ Pending execution in Supabase
