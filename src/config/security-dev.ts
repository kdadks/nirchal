// Development environment configuration
// This file overrides security restrictions for development purposes

export const DEV_CONFIG = {
  // Security checks to bypass in development
  BYPASS_PCI_DSS_CHECKS: true,
  BYPASS_HTTPS_ENFORCEMENT: true,
  BYPASS_CSP_VALIDATION: true,
  BYPASS_SECURITY_HEADERS: true,
  BYPASS_SESSION_VALIDATION: true,
  
  // localStorage keys to exclude from cardholder data checks
  EXCLUDED_STORAGE_KEYS: [
    'eyogi_session',
    'eyogi_users', 
    'cart',
    'auth_token',
    'customer_data',
    'wishlist',
    'user_preferences',
    'theme_settings',
    'language_settings'
  ],
  
  // Enable debug logging
  ENABLE_SECURITY_DEBUGGING: true,
  
  // Disable audit logging to localStorage
  DISABLE_AUDIT_LOGGING: true
};

// Check if we're in development mode
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Export combined config
export const SECURITY_CONFIG = {
  ...DEV_CONFIG,
  IS_ENABLED: IS_DEVELOPMENT
};

export default SECURITY_CONFIG;
