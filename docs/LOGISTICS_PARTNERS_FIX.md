# Logistics Partners Update Error Fix

## Problem
The logistics partners update functionality is failing with the error:
```
Error updating logistics partner
```

## Root Cause
The issue is caused by a mismatch between the Row Level Security (RLS) policy and the authentication system:

1. **RLS Policy**: The `logistics_partners` table has an RLS policy that checks for `auth.jwt() ->> 'role' = 'admin'`
2. **Authentication**: The current authentication system in `AuthContext.tsx` sets `isAdmin: true` for all signed-in users, but doesn't add a `role: 'admin'` claim to the JWT token

## Solution Options

### Option 1: Update RLS Policy (Recommended for current setup)
Update the RLS policy to work with the current authentication system:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Admin can manage logistics partners" ON logistics_partners;

-- Create new policy for authenticated users
CREATE POLICY "Authenticated users can manage logistics partners" ON logistics_partners
  FOR ALL USING (auth.role() = 'authenticated');
```

### Option 2: Add Admin Role to JWT (Future enhancement)
If you want proper role-based access control:

1. Update the authentication system to add admin roles to JWT tokens
2. Create a user roles table in the database
3. Update the AuthContext to properly manage role-based authentication

## Implementation
Run the SQL commands in `fix_logistics_partners_rls.sql` to implement the immediate fix.

## Files Modified
- Added debugging logs to `src/hooks/useAdmin.ts` (updateLogisticsPartner function)
- Added debugging logs to `src/pages/admin/LogisticsPartnersPage.tsx` (handleSubmit function)
- Created `fix_logistics_partners_rls.sql` with the RLS policy fix
