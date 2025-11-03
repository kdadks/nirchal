# Customer Data Issues & Fixes

## Issues Identified

### 1. Welcome Emails Not Sent (`welcome_email_sent: false`) - CRITICAL BUG FOUND

**Affected Customers:**
- Deepika Ranjan (rubiyano@gmail.com) - Registered: 2025-10-21
- Amit Ranjan (ranjanamit.job@gmail.com) - Registered: 2025-09-19
- Amol Ranjan (aiocean2050@gmail.com) - Registered: 2025-11-03 (Guest who placed order)

**Root Cause:**
🐛 **CRITICAL BUG:** The `mark_welcome_email_sent` RPC function had wrong parameter type:
- Function expected: `customer_id bigint`
- Actual customer IDs: `uuid`
- Frontend was calling: `parseInt(customerId)` on a UUID string
- Result: **RPC calls failed silently**, emails sent but database never marked as sent

**Impact:**
- Welcome emails WERE actually sent to customers
- Database flag was NEVER updated due to type mismatch
- System thinks emails weren't sent when they actually were

**Fix:**
1. ✅ Fixed RPC function to accept `uuid` parameter: `20250124000005_fix_mark_welcome_email_sent.sql`
2. ✅ Fixed frontend to pass UUID directly (removed parseInt)
3. Update existing customer records manually if emails were actually sent

### 2. Email Verification Not Implemented (`email_verified: false`)

**Issue:**
- `email_verified` column exists in database but no verification flow implemented
- No email verification tokens being sent
- No verification link generation
- No verification endpoint

**Impact:**
- All customers show as unverified
- No way to distinguish verified vs unverified emails
- Potential security/spam risk

**Recommended Implementation:**
1. Add email verification token generation
2. Send verification email on signup
3. Create verification endpoint
4. Update customer record when verified
5. Optional: Require verification for certain actions

**Priority:** MEDIUM (not critical for functionality but important for security)

### 3. Guest User Data Inconsistency

**Issue:**
- Amol marked as `is_guest: true` but has phone number (8520741025)
- Guest users typically shouldn't have phone numbers until account completion

**Expected Behavior:**
- Guest users: Minimal data (email, name only)
- After adding phone → Convert to regular user (`is_guest: false`)

**Fix:**
- Check if guest users with complete data should be converted to regular users
- Run SQL: `UPDATE customers SET is_guest = false WHERE id = 'xxx' AND phone IS NOT NULL`

### 4. Missing Optional Profile Data

**Fields Often Empty:**
- `date_of_birth`: null for Deepika and Amol
- `gender`: null for Deepika and Amol
- `phone`: null for Deepika

**Expected Behavior:**
- These are optional fields
- Should be collected during profile completion
- Can be prompted during first order or profile edit

**Status:** ✅ WORKING AS DESIGNED (optional fields)

## Action Plan

### Immediate Actions (Required):

1. **Send Welcome Emails**
   ```bash
   # Via admin panel or run migration script
   # Then mark as sent in database
   ```

2. **Fix Guest User Status**
   ```sql
   UPDATE customers 
   SET is_guest = false 
   WHERE phone IS NOT NULL AND is_guest = true;
   ```

### Short-term Actions (Recommended):

3. **Implement Email Verification**
   - Create verification token system
   - Send verification emails
   - Add verification endpoint
   - Update UI to show verification status

4. **Add Profile Completion Prompts**
   - Prompt for phone during checkout if missing
   - Offer profile completion after first order
   - Show profile completeness percentage

### Long-term Improvements:

5. **Customer Data Quality**
   - Add data validation at input
   - Regular cleanup of guest accounts
   - Automated welcome email retry system
   - Email deliverability monitoring

## SQL Scripts

### Check Customer Data Quality
```sql
SELECT 
  COUNT(*) as total_customers,
  SUM(CASE WHEN welcome_email_sent THEN 1 ELSE 0 END) as emails_sent,
  SUM(CASE WHEN email_verified THEN 1 ELSE 0 END) as emails_verified,
  SUM(CASE WHEN is_guest THEN 1 ELSE 0 END) as guest_users,
  SUM(CASE WHEN phone IS NULL THEN 1 ELSE 0 END) as missing_phone,
  SUM(CASE WHEN date_of_birth IS NULL THEN 1 ELSE 0 END) as missing_dob,
  SUM(CASE WHEN gender IS NULL THEN 1 ELSE 0 END) as missing_gender
FROM customers;
```

### Find Customers Needing Attention
```sql
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at,
  CASE 
    WHEN NOT welcome_email_sent THEN 'Missing Welcome Email'
    WHEN NOT email_verified THEN 'Unverified Email'
    WHEN is_guest AND phone IS NOT NULL THEN 'Should Be Regular User'
    ELSE 'OK'
  END as issue
FROM customers
WHERE 
  NOT welcome_email_sent 
  OR NOT email_verified 
  OR (is_guest AND phone IS NOT NULL)
ORDER BY created_at ASC;
```

## Implementation Files

### Email Verification (TO BE IMPLEMENTED):
1. `src/contexts/CustomerAuthContext.tsx` - Add sendVerificationEmail()
2. `functions/verify-email.ts` - New endpoint for verification
3. `src/services/transactionalEmailService.ts` - Add verification email template
4. Database: Add `email_verification_token` and `email_verification_expires` columns

### Current Working Features:
- ✅ Welcome email system (needs manual trigger for existing customers)
- ✅ Temp password generation for checkout customers
- ✅ Guest user checkout
- ✅ Profile management
- ✅ Password reset

## Testing Checklist

After fixes:
- [ ] Send test welcome email to existing customer
- [ ] Verify `welcome_email_sent` flag updates
- [ ] Check `welcome_email_sent_at` timestamp
- [ ] Confirm guest user → regular user conversion
- [ ] Test new customer registration (should get welcome email automatically)
- [ ] Test checkout as guest → should remain guest until profile completion

## Support Actions

For the 3 existing customers:

**Deepika Ranjan:**
- Action: Send welcome email manually
- Include: Standard welcome message (no temp password)
- Mark: `welcome_email_sent = true`

**Amit Ranjan:**
- Action: Send welcome email manually  
- Include: Standard welcome message (no temp password)
- Mark: `welcome_email_sent = true`
- Note: Profile is complete, active user

**Amol Ranjan:**
- Action: Convert from guest to regular user (has phone)
- Then: Send welcome email
- Mark: `is_guest = false`, `welcome_email_sent = true`

## Monitoring

Going forward, monitor:
- Welcome email delivery rate
- Email verification rate (once implemented)
- Guest to regular user conversion rate
- Profile completion rate
- Failed email sends

## Summary

**Critical:** Welcome emails not sent to existing customers (manual fix needed)
**Important:** Email verification system not implemented
**Minor:** Guest user status inconsistency
**OK:** Optional profile fields (working as designed)
