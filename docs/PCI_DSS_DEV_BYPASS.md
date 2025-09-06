# PCI DSS Development Environment Bypass

## Overview
The PCI DSS security restrictions have been disabled for the development environment to allow uninterrupted development and testing. All security checks are bypassed when `NODE_ENV === 'development'`.

## Changes Made

### 1. PaymentSecurityWrapper.tsx
- Added complete bypass of all security validations in development mode
- Excluded specific localStorage keys (`eyogi_session`, `eyogi_users`, etc.) from cardholder data checks
- Added debug logging for development environment

### 2. SecurityUtils.ts
- Modified `validateSessionSecurity()` to skip validation in development
- Modified `validateCSP()` to skip Content Security Policy checks in development  
- Modified `checkSecurityHeaders()` to bypass header validation in development
- Modified `containsCardholderData()` to always return false in development mode

### 3. vite.config.ts
- Added proper `NODE_ENV` definition to ensure environment detection works correctly
- Configured Vite to properly expose the environment variable

### 4. security-dev.ts (New Configuration File)
- Created a centralized development configuration file
- Configurable bypass options for different security checks
- Excluded storage keys list for development
- Debug logging controls

## Security Checks Disabled in Development

1. **HTTPS Enforcement**: Bypassed for localhost development
2. **Session Security**: HttpOnly cookie requirements disabled
3. **Content Security Policy**: CSP validation disabled
4. **Security Headers**: X-Frame-Options, Referrer-Policy checks disabled
5. **Cardholder Data Detection**: localStorage scanning disabled for development keys
6. **PCI DSS Compliance**: All compliance checks bypassed

## Excluded localStorage Keys
The following keys are excluded from cardholder data validation in development:
- `eyogi_session`
- `eyogi_users`  
- `cart`
- `auth_token`
- `customer_data`
- `wishlist`
- `user_preferences`
- `theme_settings`
- `language_settings`

## Environment Detection
The system checks for development environment using:
```javascript
process.env.NODE_ENV === 'development'
```

## Debug Logging
When in development mode with debugging enabled, you'll see console messages like:
```
[SECURITY] Development mode: Bypassing all PCI DSS checks
[SECURITY] Development mode: Bypassing session security validation
[SECURITY] Development mode: Bypassing CSP validation
[SECURITY] Development mode: Bypassing security headers validation
[SECURITY] Development mode: Bypassing cardholder data validation
```

## Production Safety
⚠️ **Important**: All security restrictions will be fully enforced in production environment. This bypass only works when `NODE_ENV === 'development'`.

## Testing the Changes

1. Start the development server: `npm run dev`
2. Open developer console and look for `[SECURITY]` debug messages
3. Payment processing should now work without security warnings
4. The red security violation banner should not appear

## Reverting Changes
To re-enable PCI DSS checks in development (if needed):

1. Edit `src/config/security-dev.ts` and set `BYPASS_PCI_DSS_CHECKS: false`
2. Or modify the individual bypass flags for specific security checks

## Files Modified
- `src/components/security/PaymentSecurityWrapper.tsx`
- `src/utils/securityUtils.ts`
- `vite.config.ts`
- `src/config/security-dev.ts` (new file)
