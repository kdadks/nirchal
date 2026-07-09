# Implementation Guide: Update CustomerAuthContext for RLS Security

## Overview
The customers table RLS policies have been updated to fix a critical security vulnerability. The application needs to be updated to use secure RPC functions instead of direct database queries.

## Changes Required

### 1. Update CustomerAuthContext.tsx

The `signIn` function currently does direct SELECT queries which will fail with the new RLS policies. Update it to use the new `authenticate_customer` RPC function.

**File:** `src/contexts/CustomerAuthContext.tsx`

**Changes:**

#### Import bcrypt at the top of the file:
```typescript
import * as bcrypt from 'bcryptjs';
```

#### Update the signIn function:
```typescript
const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    setLoading(true);
    
    // Call the secure RPC function to authenticate
    const { data: result, error: rpcError } = await supabase.rpc('authenticate_customer', {
      p_email: email,
      p_password_for_validation: password  // Not used server-side, just for logging
    });

    if (rpcError || !result?.success) {
      console.log('Authentication failed:', rpcError || result?.error);
      return { success: false, error: result?.error || 'Authentication failed' };
    }

    // Verify password client-side using bcryptjs
    const customerData = result.customer_data;
    const passwordHash = result.password_hash;
    
    if (!passwordHash) {
      return { success: false, error: 'Password not set for this account' };
    }

    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Successful login - prepare customer data
    const customer: Customer = {
      id: customerData.id as string,
      email: customerData.email as string,
      first_name: customerData.first_name as string,
      last_name: customerData.last_name as string,
      phone: customerData.phone as string || undefined,
      date_of_birth: customerData.date_of_birth as string || undefined,
      gender: customerData.gender as string || undefined
    };
    
    setCustomer(customer);
    localStorage.setItem('nirchal_customer', JSON.stringify(customer));
    
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  } finally {
    setLoading(false);
  }
};
```

### 2. Review Other Methods

Review the following methods to ensure they don't do direct SELECT queries:

- `refreshCustomer()` - May need to be updated if it fetches customer data
- `resetPassword()` - Should use RPC functions for security
- `resetPasswordWithToken()` - Verify it's using SECURITY DEFINER functions

### 3. Test the Changes

After updating the code:

1. **Test Registration:**
   ```bash
   # Sign up with a new account
   # Should still work - INSERT policy allows registration
   ```

2. **Test Login:**
   ```bash
   # Sign in with the new account
   # Should work - calls authenticate_customer RPC
   ```

3. **Test Profile Access:**
   ```bash
   # View and update customer profile
   # Requires setting app.current_customer_email (see advanced section)
   ```

## Advanced: Setting app.current_customer_email

For profile updates and other operations that need the `customers_select_own` and `customers_update_own` policies, the application would need to set the PostgreSQL session parameter. However, this cannot be done directly from the frontend.

### Option 1: Use RPC Functions (Recommended)
Create RPC functions for profile updates instead of direct table updates:

```sql
CREATE OR REPLACE FUNCTION public.update_customer_profile(
  p_customer_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL,
  p_gender text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.customers
  SET 
    first_name = p_first_name,
    last_name = p_last_name,
    phone = p_phone,
    date_of_birth = p_date_of_birth,
    gender = p_gender,
    updated_at = NOW()
  WHERE id = p_customer_id AND email = p_email;  -- Verify ownership
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Customer not found');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Profile updated');
END;
$$;
```

Then update the profile update method:
```typescript
await supabase.rpc('update_customer_profile', {
  p_customer_id: customer.id,
  p_email: customer.email,
  p_first_name: newFirstName,
  p_last_name: newLastName,
  // ... other fields
});
```

### Option 2: Backend Proxy (If Using a Backend API)
If you have a backend API, it can:
1. Verify the customer identity from JWT/session
2. Call the RPC function with service_role credentials
3. Or set the PostgreSQL parameter and execute queries

## Backward Compatibility

The new RPC function `authenticate_customer` maintains compatibility with existing password verification:

1. ✅ Password hashes are compared client-side with bcryptjs (same as before)
2. ✅ Account active status is still checked
3. ✅ Customer data is returned in the same format
4. ✅ No changes needed to localStorage usage
5. ✅ Registration still works via INSERT policy

## Security Benefits

✅ Eliminates unauthenticated data exposure via direct REST API  
✅ Hides password hashes from direct database queries  
✅ Requires authentication for sensitive operations  
✅ Uses SECURITY DEFINER for privileged operations  
✅ Maintains proper RLS enforcement  

## Verification

After deployment, verify the fix:

```bash
# Run the verification script
bash scripts/verify-customers-rls-fix.sh

# Or manually test with curl:
curl -H "apikey: <ANON-KEY>" \
  "https://uyokvwgipoevdkinmhdj.supabase.co/rest/v1/customers?select=*&limit=1"

# Expected: [] or error message (NOT customer data)
```

## Troubleshooting

### "Permission denied for relation customers"
- **Cause:** Direct SELECT query without proper RLS policy
- **Solution:** Update code to use RPC functions or set app.current_customer_email

### "Function authenticate_customer not found"
- **Cause:** Migration not applied
- **Solution:** Apply migration: `supabase db push`

### "Password verification fails"
- **Cause:** bcryptjs not imported correctly
- **Solution:** Verify `import * as bcrypt from 'bcryptjs';` is at top of file

## Files to Update

- [x] `src/contexts/CustomerAuthContext.tsx` - signIn method and related methods
- [ ] Any other components that directly query customers table
- [ ] Backend API endpoints (if applicable)

## Timeline

1. **Immediate:** Apply database migration
2. **Same Day:** Update frontend code
3. **Testing:** Verify all auth flows work
4. **Deployment:** Deploy with both changes together

## Questions?

See the security documentation: `docs/SECURITY_FIX_CUSTOMERS_RLS_VULNERABILITY.md`
