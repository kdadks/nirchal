# Production Security Exclusions

This document outlines the security measures implemented to ensure sensitive files are not deployed to production.

## Files Protected from Production Deployment

### Database Setup and Security Files
- `*.sql` - All SQL files
- `*rls*.sql` / `*rls*.js` - Row Level Security setup files
- `complete-rls-setup.sql` - Comprehensive RLS setup script
- `final-rls-setup.js` - RLS verification script
- `simple-rls-setup.js` - Standalone RLS manager
- `schema-*.sql` - Database schema files
- `create_*.sql` - Database creation scripts
- `setup_*.sql` - Setup and configuration scripts

### Diagnostic and Testing Files
- `test-*.js` - All test files
- `diagnose*.js` - Database diagnostic scripts
- `analyze*.js` - Database analysis tools
- `*-diagnostics.js` - System diagnostic files
- `debug-*.html` - Debug utilities
- `fix-*.js` - Database fix scripts
- `security-*.js` - Security analysis tools

### Configuration and Setup Files
- `add-webhook-secret.js` - Webhook configuration
- `*-settings-manager.js` - Settings management scripts
- `ensure-*.js` / `ensure-*.mjs` - Environment setup scripts
- `create-storage-buckets.mjs` - Storage bucket setup
- `investigate-*.mjs` - Investigation utilities

### Documentation Files
- `*_SETUP.md` - Setup documentation
- `RLS_*.md` - RLS documentation
- `GITHUB_API_SETUP.md` - API setup guides
- `STORAGE_BUCKET_SETUP.md` - Storage setup guides
- `SCHEMA_*.sql` - Schema documentation
- `*_COMPLIANCE_*.md` - Compliance documentation

## Protection Mechanisms

### 1. .gitignore Protection
All sensitive files are excluded from Git commits via comprehensive `.gitignore` patterns.

### 2. Build Exclusions
Both deployment scripts (`deploy.ps1` and `deploy.sh`) explicitly exclude sensitive files from production packages.

### 3. Package.json Cleaning
The `clean-package.js` utility removes development and diagnostic scripts from the production `package.json`:
- `diagnose` / `diagnose-db` / `diagnose-auth` / `diagnose-direct`
- `advanced-diagnose` / `test-other-tables` / `security-analysis`
- `test-fix` / `init-settings` / `migrate-settings`

### 4. Deployment Package Structure
The deployment package excludes:
- All SQL files
- RLS setup scripts
- Test and diagnostic files
- Debug utilities
- Setup and configuration scripts
- Sensitive documentation

## Verification

### Check Excluded Files
```bash
# List files excluded by .gitignore
git ls-files --others --ignored --exclude-standard

# Verify deployment package contents
ls -la deployment-package/
```

### Production Safety
- ✅ No database credentials or setup scripts
- ✅ No diagnostic or testing utilities
- ✅ No RLS configuration files
- ✅ No security analysis tools
- ✅ Clean package.json without debug scripts
- ✅ Only production-ready code and assets

## Maintenance

When adding new sensitive files:
1. Add appropriate patterns to `.gitignore`
2. Update exclusion patterns in `deploy.ps1` and `deploy.sh`
3. Update `clean-package.js` if adding new npm scripts
4. Test deployment package to verify exclusions

This ensures complete separation between development/setup utilities and production code.