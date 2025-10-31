# Supabase Database Backup Guide

This guide explains how to create a complete backup of your Supabase database including data, schema, functions, triggers, indexes, policies, and auth.

## Prerequisites

### Option 1: Using pg_dump (Recommended for Windows)

1. **Install PostgreSQL Client Tools**
   - Download from: https://www.postgresql.org/download/windows/
   - Or install via Chocolatey: `choco install postgresql`
   - Only the command-line tools are needed (pg_dump, psql)

2. **Get your database credentials:**
   - Go to Supabase Dashboard → Project Settings → Database
   - Note down:
     - Host: `db.YOUR_PROJECT_REF.supabase.co`
     - Port: `5432`
     - Database: `postgres`
     - User: `postgres`
     - Password: (from Database Settings)

### Option 2: Using Supabase CLI

1. **Install Supabase CLI:**
   ```powershell
   npm install -g supabase
   ```

2. **Set DATABASE_URL environment variable:**
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

## Backup Methods

### Method 1: Using the Comprehensive Backup Script (pg_dump)

1. **Edit the script configuration:**
   Open `scripts/backup-supabase.ps1` and update:
   ```powershell
   $PROJECT_REF = "your-project-ref"  # From your Supabase URL
   ```

2. **Set your database password as environment variable:**
   ```powershell
   $env:SUPABASE_DB_PASSWORD = "your-database-password"
   ```

3. **Run the backup script:**
   ```powershell
   .\scripts\backup-supabase.ps1
   ```

This creates 6 backup files in `supabase/backups/`:
- `full_backup_TIMESTAMP.sql` - Complete database (schema + data)
- `schema_backup_TIMESTAMP.sql` - Structure only (tables, functions, triggers, indexes, policies)
- `data_backup_TIMESTAMP.sql` - Data only
- `public_schema_TIMESTAMP.sql` - Public schema
- `auth_schema_TIMESTAMP.sql` - Auth schema (users, sessions)
- `storage_schema_TIMESTAMP.sql` - Storage schema

### Method 2: Using Supabase CLI Script

1. **Set DATABASE_URL:**
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

2. **Run the CLI backup script:**
   ```powershell
   .\scripts\backup-supabase-cli.ps1
   ```

### Method 3: Manual pg_dump Commands

```powershell
# Set password environment variable
$env:PGPASSWORD = "your-database-password"

# Full backup (schema + data + everything)
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres `
  --clean --if-exists --quote-all-identifiers `
  --no-owner --no-acl `
  -f supabase/backups/full_backup.sql

# Schema only (includes functions, triggers, indexes, policies, RLS)
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres `
  --schema-only --clean --if-exists `
  -f supabase/backups/schema_only.sql

# Data only
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres `
  --data-only --column-inserts `
  -f supabase/backups/data_only.sql

# Specific schema (e.g., auth)
pg_dump -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres `
  --schema=auth --clean --if-exists `
  -f supabase/backups/auth_schema.sql

# Clear password
Remove-Item Env:\PGPASSWORD
```

### Method 4: Using Supabase CLI Directly

```powershell
# Link your project (one-time setup)
supabase link --project-ref YOUR_PROJECT_REF

# Dump all schemas and data
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f backup.sql

# Or if linked:
supabase db dump -f backup.sql
```

## What's Included in Backups

✅ **Schema/Structure:**
- Tables and columns
- Primary keys, foreign keys, constraints
- Indexes (including GiN, GiST, B-tree, etc.)
- Functions and stored procedures
- Triggers
- Views
- Sequences
- Custom types

✅ **Security:**
- Row Level Security (RLS) policies
- Role permissions
- Column-level security

✅ **Data:**
- All table data
- Auth data (users, sessions, etc.)
- Storage metadata

✅ **Extensions:**
- Installed PostgreSQL extensions

## Restoring from Backup

### Full Restore:
```powershell
# Set password
$env:PGPASSWORD = "your-database-password"

# Restore full backup
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres -f supabase/backups/full_backup.sql

# Clear password
Remove-Item Env:\PGPASSWORD
```

### Schema Only Restore:
```powershell
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres -f supabase/backups/schema_backup.sql
```

### Data Only Restore:
```powershell
psql -h db.YOUR_PROJECT_REF.supabase.co -p 5432 -U postgres -d postgres -f supabase/backups/data_backup.sql
```

## Automated Backups

### Schedule with Windows Task Scheduler:

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily, weekly, etc.)
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-File "D:\ITWala Projects\nirchal\scripts\backup-supabase.ps1"`

### Using npm script:

Add to `package.json`:
```json
{
  "scripts": {
    "backup": "powershell -File scripts/backup-supabase.ps1",
    "backup:cli": "powershell -File scripts/backup-supabase-cli.ps1"
  }
}
```

Then run: `npm run backup`

## Best Practices

1. **Regular Backups:** Schedule daily or weekly backups
2. **Multiple Locations:** Store backups in multiple places (local, cloud storage, git)
3. **Test Restores:** Periodically test restoring backups to ensure they work
4. **Rotate Backups:** Keep last 7 daily, 4 weekly, 12 monthly backups
5. **Secure Storage:** Encrypt backup files if they contain sensitive data
6. **Before Major Changes:** Always backup before migrations or major updates

## Troubleshooting

### "pg_dump: command not found"
Install PostgreSQL client tools or add to PATH

### "Connection refused"
Check if your IP is whitelisted in Supabase Database settings

### "Authentication failed"
Verify password and connection string

### "Permission denied"
Check if your database user has sufficient privileges

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase Database Settings](https://supabase.com/dashboard/project/_/settings/database)
