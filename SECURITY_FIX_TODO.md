# Quick Action Items - Security Fix Completion

## Immediate Actions Required

### ✅ COMPLETED: Database Security Fix
- [x] Created migration file with RPC function and secure RLS policies
- [x] Created comprehensive documentation
- [x] Created verification script
- [x] Identified secondary vulnerabilities

### ⏳ TODO: Frontend Implementation

Update `src/contexts/CustomerAuthContext.tsx`:

**Location: Line ~95 (signIn function)**

**Replace this:**
```typescript
const { data: customerData, error } = await supabase
  .from('customers')
  .select('id, email, first_name, last_name, phone, date_of_birth, gender, password_hash, is_active')
  .eq('email', email)
  .single();
```

**With this:**
```typescript
// Call secure RPC function
const { data: result, error: rpcError } = await supabase.rpc('authenticate_customer', {
  p_email: email
});

if (rpcError || !result?.success) {
  return { success: false, error: result?.error || 'Authentication failed' };
}

const customerData = result.customer_data;
const passwordHash = result.password_hash;

// Verify password client-side
const isPasswordValid = await bcrypt.compare(password, passwordHash);
if (!isPasswordValid) {
  return { success: false, error: 'Invalid email or password' };
}
```

**Also add import at top:**
```typescript
import * as bcrypt from 'bcryptjs';
```

---

## Deployment Sequence

```
1. Apply database migration to Supabase
   → supabase db push
   or via SQL Editor: supabase/migrations/20260709000001_secure_customers_rls.sql

2. Update frontend code
   → Modify src/contexts/CustomerAuthContext.tsx

3. Test locally
   → npm run dev
   → Test signup, login, profile access

4. Run verification script
   → bash scripts/verify-customers-rls-fix.sh

5. Deploy to production
   → Deploy frontend with updated code
   → Monitor logs for errors
```

---

## Testing Before Deployment

### 1. Local Testing
```bash
# Start dev server
npm run dev

# Test flows:
# 1. Register new account
# 2. Login with correct password
# 3. Login with wrong password (should fail)
# 4. View profile
# 5. Update profile (if implemented)
# 6. Logout
```

### 2. Database Verification
```sql
-- Check policies applied correctly
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Expected policies:
-- service_role_all_access (ALL)
-- allow_registration (INSERT)
-- customers_select_own (SELECT)
-- customers_update_own (UPDATE)
-- customers_delete_own (DELETE)
```

### 3. Security Verification
```bash
# Run verification script
bash scripts/verify-customers-rls-fix.sh

# Manual curl test
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  "$VITE_SUPABASE_URL/rest/v1/customers?select=*&limit=1"

# Expected: [] (empty) or error message, NOT customer data
```

---

## Files Provided

```
✅ supabase/migrations/20260709000001_secure_customers_rls.sql
   - Database migration with RPC function and RLS policies

✅ docs/SECURITY_FIX_CUSTOMERS_RLS_VULNERABILITY.md
   - Vulnerability explanation & technical details

✅ docs/IMPLEMENT_CUSTOMERS_RLS_SECURITY_FIX.md
   - Frontend implementation guide with code examples

✅ docs/SECURITY_FIX_DEPLOYMENT_SUMMARY.md
   - Deployment checklist & timeline

✅ docs/RLS_SECURITY_AUDIT_SECONDARY_ISSUES.md
   - Additional vulnerabilities & recommendations

✅ scripts/verify-customers-rls-fix.sh
   - Automated verification script

✅ supabase/migrations/AUDIT_RLS_VULNERABILITIES.sql
   - SQL audit queries for RLS policies
```

---

## Rollback Procedure (If Needed)

⚠️ **Only if critical issues arise**

```sql
-- Drop new function
DROP FUNCTION IF EXISTS public.authenticate_customer(text, text);

-- Drop new policies
DROP POLICY IF EXISTS "service_role_all_access" ON public.customers;
DROP POLICY IF EXISTS "allow_registration" ON public.customers;
DROP POLICY IF EXISTS "customers_select_own" ON public.customers;
DROP POLICY IF EXISTS "customers_update_own" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_own" ON public.customers;

-- Restore old policies from backup
-- (See supabase/backups/public_schema_20251030_192903.sql)
```

---

## Important Notes

⚠️ **MUST DO BOTH:**
- Apply database migration
- Update frontend code
- Deploy together (no staggered deployment)

⚠️ **Password verification:**
- Must be done client-side with bcryptjs
- RPC returns password_hash for comparison
- Never transmit passwords to server

⚠️ **Secondary vulnerabilities:**
- 82 policies with USING (true) found
- Wishlist table needs immediate attention
- Review `RLS_SECURITY_AUDIT_SECONDARY_ISSUES.md`

---

## Success Indicators

After deployment, verify:

✅ No customer data accessible via direct REST API  
✅ User registration still works  
✅ User login still works  
✅ Application has no console errors  
✅ Verification script shows "SECURE" status  
✅ No performance issues  

---

## Estimated Timeline

- **Database migration:** 5-10 minutes
- **Frontend code update:** 20-30 minutes
- **Testing:** 30-45 minutes
- **Deployment:** 10-15 minutes
- **Total:** ~1.5-2 hours

---

## Support

For questions, refer to:
- Technical details: `SECURITY_FIX_CUSTOMERS_RLS_VULNERABILITY.md`
- Implementation help: `IMPLEMENT_CUSTOMERS_RLS_SECURITY_FIX.md`
- Deployment issues: `SECURITY_FIX_DEPLOYMENT_SUMMARY.md`

---

**Status:** READY FOR DEPLOYMENT  
**Created:** July 9, 2026  
**Priority:** CRITICAL - Fixes exposure of customer PII
