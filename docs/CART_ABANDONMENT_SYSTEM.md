# Cookie Management and Cart Abandonment System

## Overview
A comprehensive cookie management and cart abandonment tracking system has been built to capture guest user information and track abandoned shopping carts for recovery campaigns.

## Components Created

### 1. Cookie Utility Functions (`src/utils/cookieUtils.ts`)
- **saveGuestInfo**: Save guest name, email, and phone to cookie
- **getGuestInfo**: Retrieve guest information from cookie
- **hasGuestInfo**: Check if guest info exists
- **updateGuestInfo**: Update partial guest information
- **removeGuestInfo**: Remove guest information
- Cookie expiry: 365 days (1 year)
- SameSite: Lax for security

### 2. Guest Info Capture Modal (`src/components/GuestInfoModal.tsx`)
- Appears when first item is added to cart by non-authenticated guest
- Captures:
  - Full name (required)
  - Email address (required, validated)
  - Phone number (required, 10-digit validation)
- Features:
  - Pre-fills if guest info already exists in cookie
  - "Skip for Now" option
  - Privacy notice displayed
  - Real-time form validation
  - Toast notifications on success

### 3. Cart Abandonment Tracking Hook (`src/hooks/useCartAbandonment.ts`)
Tracks cart abandonments through multiple triggers:
- **Page Visibility**: When user switches tabs/minimizes window
- **Browser Close**: When user closes browser or navigates away
- **Inactivity**: After 15 minutes of no user interaction
- **User Activity Tracking**: Monitors mouse, keyboard, scroll, touch events

Stores in database:
- Guest contact information (name, email, phone)
- Cart items (JSON array with product details)
- Total items count
- Total cart value
- Timestamp of abandonment
- Browser/device information (optional)

### 4. Database Schema (`supabase/migrations/20251021_create_abandoned_carts.sql`)
**Table: `abandoned_carts`**
- `id` (UUID, Primary Key)
- `guest_name` (TEXT, required)
- `guest_email` (TEXT, nullable)
- `guest_phone` (TEXT, nullable)
- `user_id` (UUID, nullable, foreign key)
- `cart_items` (JSONB)
- `total_items` (INTEGER)
- `total_value` (DECIMAL)
- `abandoned_at` (TIMESTAMP)
- `recovered_at` (TIMESTAMP, nullable)
- `status` (TEXT: abandoned, recovered, expired, contacted)
- `email_sent` (BOOLEAN)
- `email_sent_at` (TIMESTAMP)
- `sms_sent` (BOOLEAN)
- `sms_sent_at` (TIMESTAMP)
- `browser_info` (JSONB, optional)
- `device_info` (JSONB, optional)
- `created_at`, `updated_at` (TIMESTAMP)

**Indexes:**
- guest_email
- guest_phone
- user_id
- status
- abandoned_at
- created_at

**RLS Policies:**
- Service role: Full access
- Authenticated users (admins): Read and update access
- Anonymous users: Insert only (for tracking)

### 5. Cart Context Integration (`src/contexts/CartContext.tsx`)
Updated to:
- Show guest info modal when first item added by non-authenticated guest
- Integrate cart abandonment tracking hook
- Pass cart state and user authentication status to tracking hook
- Handle guest info submission and modal closing

### 6. Admin Dashboard (`src/pages/admin/AbandonedCartsPage.tsx`)
Features:
- **View abandoned carts** with full details
- **Filter by status**: abandoned, contacted, recovered, expired
- **Search** by name, email, or phone
- **View cart items** in modal popup
- **Mark as recovered** to track successful conversions
- **Mark email sent** to track recovery campaign communications
- **Pagination** for large datasets
- **Real-time refresh** functionality

Display columns:
- Customer name
- Contact information (email & phone)
- Cart details (items count, total value)
- Abandonment timestamp
- Current status
- Follow-up actions taken
- Quick action buttons

## Usage Flow

### For Guest Users:
1. User visits site and adds first item to cart
2. Guest info modal appears (if not authenticated and no cookie exists)
3. User provides name, email, phone OR skips
4. Information saved to cookie (if provided)
5. Cart abandonment tracking begins
6. If user leaves site, abandoned cart is saved to database

### For Admins:
1. Navigate to "Abandoned Carts" page
2. View all abandoned carts with filters
3. See customer contact information
4. View cart items and total value
5. Send recovery emails/SMS
6. Mark as contacted/recovered
7. Track conversion rate

## Benefits

1. **Customer Data Collection**: Automatically captures guest information
2. **Cart Recovery**: Track and recover abandoned carts
3. **Marketing Campaigns**: Build email/SMS lists for remarketing
4. **Analytics**: Understand abandonment patterns
5. **Revenue Recovery**: Convert abandoned carts to sales
6. **User Experience**: Non-intrusive information capture

## Next Steps (Optional Enhancements)

1. **Email Recovery Campaigns**:
   - Automated email sending (24 hours after abandonment)
   - Email templates with cart items
   - Discount codes for recovery incentive

2. **SMS Recovery**:
   - SMS integration (Twilio, etc.)
   - Automated SMS campaigns

3. **Analytics Dashboard**:
   - Abandonment rate metrics
   - Recovery rate tracking
   - Revenue recovered statistics
   - Time-based trends

4. **A/B Testing**:
   - Test different modal timings
   - Test incentive offers
   - Optimize conversion rates

5. **Advanced Tracking**:
   - Browser/device fingerprinting
   - Geolocation data
   - Referrer URL tracking

## Database Migration

To apply the database schema:
```bash
# Run the migration file
psql -h [your-supabase-host] -U postgres -d postgres -f supabase/migrations/20251021_create_abandoned_carts.sql
```

Or use Supabase CLI:
```bash
supabase migration up
```

## Security Considerations

- Cookies use SameSite=Lax for CSRF protection
- 1-year cookie expiration (adjustable)
- Row Level Security (RLS) enabled on database
- Email/phone validation before storage
- Anonymous users can only insert, not read
- GDPR-compliant data handling (user can skip)

## Testing Checklist

- [ ] Test guest info modal appearance on first cart add
- [ ] Test cookie persistence after modal submission
- [ ] Test "Skip for Now" functionality
- [ ] Test cart abandonment on tab switch
- [ ] Test cart abandonment on browser close
- [ ] Test inactivity timer (15 minutes)
- [ ] Test authenticated user (no modal shown)
- [ ] Test admin dashboard filters
- [ ] Test admin dashboard search
- [ ] Test marking cart as recovered
- [ ] Test marking email as sent
- [ ] Test pagination on admin page
