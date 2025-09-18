# Database Diagnostics Scripts

These scripts help diagnose the logistics partners RLS permission issue by checking the database directly.

## Available Scripts

### 1. Database Diagnostics
```bash
npm run diagnose-db
```
- Checks authentication status
- Tests read/write access to logistics_partners table
- Compares with vendors table behavior
- Shows database policies (if accessible)

### 2. Authentication Diagnostics
```bash
npm run diagnose-auth
```
**⚠️ Requires manual setup:** Edit `auth-diagnostics.js` and add your admin credentials.

- Tests actual sign-in process
- Analyzes JWT token contents
- Checks what authentication context the database sees
- Tests authenticated update operations

### 3. Direct Database Check
```bash
npm run diagnose-direct
```
- Uses service key (if available) to bypass RLS
- Checks RLS status on tables
- Lists all policies
- Compares logistics_partners vs vendors table setup

## Quick Fix

If diagnostics confirm it's an RLS issue, run this SQL in your Supabase dashboard:

```sql
ALTER TABLE logistics_partners DISABLE ROW LEVEL SECURITY;
```

## Environment Variables Needed

- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_ANON_KEY` (required)
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for direct-db-check)

## Expected Results

- **Working scenario**: Vendors table likely has RLS disabled
- **Broken scenario**: Logistics partners has RLS enabled with non-matching policies

The scripts will show you exactly what's different between the working and broken tables.
