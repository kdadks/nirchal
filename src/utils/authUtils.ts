import { supabase } from '../config/supabase';
import { toastManager } from './toastManager';

/**
 * Handles JWT expired errors by attempting to refresh the session
 * @param error The error object from Supabase
 * @param retryCallback Function to retry the original operation
 * @returns Promise<boolean> - true if retry was successful, false if refresh failed
 */
export const handleJWTError = async (
  error: any,
  retryCallback: () => Promise<void>
): Promise<boolean> => {
  if (!error) return false;
  
  const errorMsg = (error.message || '').toLowerCase();
  
  if (!errorMsg.includes('jwt') || !errorMsg.includes('expired')) {
    return false; // Not a JWT error
  }
  
  try {
    console.log('[AuthUtils] JWT expired, attempting token refresh...');
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('[AuthUtils] Token refresh failed:', refreshError);
      toastManager.jwtExpired();
      return false;
    }
    
    console.log('[AuthUtils] Token refresh successful, retrying operation...');
    await retryCallback();
    return true;
  } catch (refreshError) {
    console.error('[AuthUtils] Token refresh error:', refreshError);
    toastManager.jwtExpired();
    return false;
  }
};

/**
 * Checks if an error is a JWT expiration error
 */
export const isJWTExpiredError = (error: any): boolean => {
  if (!error) return false;
  const errorMsg = (error.message || '').toLowerCase();
  return errorMsg.includes('jwt') && errorMsg.includes('expired');
};

/**
 * Creates a standardized error message for JWT expiration
 */
export const getJWTExpiredMessage = (): string => {
  return 'Your session has expired. Please refresh the page to continue.';
};
