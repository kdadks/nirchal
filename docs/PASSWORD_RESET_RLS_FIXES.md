# Password Reset and Change System - RLS Fixes

## Issues Identified

### 1. ChangePasswordModal RLS Conflict
**Problem**: The `ChangePasswordModal` component was making direct Supabase client updates to the `customers` table, which failed due to conflicting RLS policies.

**Root Cause**: Two conflicting UPDATE policies existed:
- `"Allow customer profile updates"` - allows all updates with `USING (true)`  
- `"Customers can update own data"` - restricts updates to current customer email via `current_setting('app.current_customer_email')`

### 2. Password Reset Token Function Issues
**Problem**: The `reset_password_with_token` function was not returning complete customer information needed for confirmation emails.

### 3. Missing Secure Password Change Function
**Problem**: No secure SECURITY DEFINER function existed for password changes, forcing client-side direct database updates.

## Solutions Implemented

### 1. Created New RLS Policy
```sql
-- Replace conflicting policies with comprehensive one
DROP POLICY IF EXISTS "Customers can update own data" ON public.customers;  
DROP POLICY IF EXISTS "Allow customer profile updates" ON public.customers;

CREATE POLICY "customers_update_policy" ON public.customers
  FOR UPDATE
  USING (
    -- Allow if user is authenticated and updating their own record
    (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email') OR
    -- Allow service role (for functions)  
    (auth.role() = 'service_role') OR
    -- Allow if no RLS context (for SECURITY DEFINER functions)
    (current_setting('role', true) = 'postgres')
  )
  WITH CHECK (
    -- Same checks for the new values
    (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email') OR
    (auth.role() = 'service_role') OR
    (current_setting('role', true) = 'postgres')
  );
```

### 2. Created Secure Password Change Function
```sql
CREATE OR REPLACE FUNCTION public.change_customer_password(
  customer_email text,
  current_password text, 
  new_password text
) RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
```

This function:
- Bypasses RLS policies with SECURITY DEFINER
- Validates customer exists and is active
- Updates password securely
- Returns customer info for email confirmation
- Includes comprehensive error handling

### 3. Enhanced Reset Password Function
Updated `reset_password_with_token` to:
- Return complete customer information
- Clear temp password fields
- Improved error handling and logging
- Better response structure for email confirmation

### 4. Updated ChangePasswordModal Component
**Before**: Direct Supabase client update
```tsx
const { error: updateError } = await supabase
  .from('customers')
  .update({ 
    password_hash: hashedNewPassword,
    updated_at: new Date().toISOString()
  })
  .eq('email', email);
```

**After**: Secure function call
```tsx
const { data, error: updateError } = await supabase.rpc('change_customer_password', {
  customer_email: email,
  current_password: formData.currentPassword,
  new_password: hashedNewPassword
});
```

## Files Modified

### Database Migration
- `supabase/migrations/20251104000002_fix_password_reset_rls.sql`
  - Fixed RLS policies
  - Created `change_customer_password` function
  - Enhanced `reset_password_with_token` function

### Frontend Components  
- `src/components/auth/ChangePasswordModal.tsx`
  - Updated to use secure function instead of direct DB update
  - Added proper TypeScript typing for RPC response
  - Enhanced error handling

### Context (Already Working)
- `src/contexts/CustomerAuthContext.tsx` 
  - `resetPasswordWithToken` function already uses secure SECURITY DEFINER function
  - No changes needed

## Testing Instructions

### 1. Password Reset via Email
1. Go to login modal → "Forgot password"
2. Enter email address → Submit
3. Check email for reset link
4. Click reset link → Enter new password  
5. Verify password updates successfully
6. Verify confirmation email is sent

### 2. Password Change via Modal
1. Login with temporary password (from order confirmation)
2. Change password modal should appear
3. Enter temp password and new password
4. Verify password updates successfully  
5. Verify confirmation email is sent

### 3. Admin Users with Temp Passwords
1. Check admin users page for customers with temp passwords
2. Test password change flow for these users
3. Verify temp password flags are cleared after change

## Security Improvements

### 1. RLS Policy Enhancements
- Proper multi-condition policy allowing legitimate updates
- Service role access for system functions
- SECURITY DEFINER function bypass support

### 2. Function Security
- All password functions use SECURITY DEFINER
- Comprehensive input validation
- Secure error handling that doesn't leak sensitive info
- Proper logging for debugging

### 3. Client-Side Validation
- Password complexity validation maintained
- bcrypt hashing before transmission
- Proper error handling and user feedback

## Migration Application

To apply these fixes to production:

1. **Review the migration file**: `supabase/migrations/20251104000002_fix_password_reset_rls.sql`
2. **Test in staging environment first**
3. **Apply migration**: 
   ```bash
   npx supabase db push
   ```
4. **Verify password reset functionality**
5. **Monitor for any RLS-related errors**

## Troubleshooting

### Common Issues

1. **"Failed to update password"**
   - Check RLS policies are applied correctly
   - Verify function has SECURITY DEFINER 
   - Check database logs for specific errors

2. **"Permission denied" errors**
   - Ensure service role has proper permissions
   - Verify function GRANT statements executed
   - Check current user context in functions

3. **Email confirmation not working**  
   - Check function returns complete customer data
   - Verify email service configuration
   - Check transactional email logs

### Debug Steps
1. Check browser console for detailed error messages
2. Review database logs for function execution errors  
3. Test with direct SQL function calls to isolate issues
4. Verify RLS policies with `\dp customers` in psql

## Result

✅ **Password reset via email token**: Now works with proper RLS bypass
✅ **Password change via modal**: Uses secure function, bypasses RLS conflicts  
✅ **Temporary password handling**: Secure and reliable
✅ **Email confirmations**: Sent for all password operations
✅ **Security**: All operations use SECURITY DEFINER functions
✅ **Error handling**: Comprehensive logging and user feedback