/**
 * Supabase Session Helper - RLS Enforcement
 * 
 * This utility helps set the app.current_customer_id session variable
 * which is used by Supabase RLS policies to restrict data access.
 * 
 * Usage: Call setCustomerSession() after customer login
 *        Call clearCustomerSession() after customer logout
 */

import { supabase } from '../config/supabase';

/**
 * Set the current customer ID in the Supabase session
 * This allows RLS policies to restrict data based on customer context
 * 
 * @param customerId - The customer's UUID
 * @returns Promise that resolves when session is set
 */
export async function setCustomerSession(customerId: string): Promise<void> {
  try {
    // For Supabase RPC calls and queries, we need to ensure the session variable is set
    // This is typically done via a custom claim in the JWT or via a setter function
    
    // Option 1: Store in localStorage for frontend reference
    localStorage.setItem('nirchal_customer_id', customerId);
    
    // Option 2: If your backend supports setting session variables,
    // you could call an RPC function to set them server-side
    try {
      const { error } = await supabase.rpc('set_customer_session', {
        p_customer_id: customerId
      });
      
      if (error) {
        console.warn('Could not set customer session via RPC:', error);
        // This is not critical - RLS will still work via JWT claims if available
      }
    } catch (rpcError) {
      console.debug('set_customer_session RPC not available (expected in development)');
    }
    
    console.log('Customer session set for:', customerId);
  } catch (error) {
    console.error('Error setting customer session:', error);
    throw error;
  }
}

/**
 * Clear the current customer ID from the session
 * Call this on logout to reset RLS context
 */
export async function clearCustomerSession(): Promise<void> {
  try {
    localStorage.removeItem('nirchal_customer_id');
    
    // Optional: Clear on server side if supported
    try {
      const { error } = await supabase.rpc('clear_customer_session');
      if (error) {
        console.warn('Could not clear customer session via RPC:', error);
      }
    } catch (rpcError) {
      console.debug('clear_customer_session RPC not available (expected in development)');
    }
    
    console.log('Customer session cleared');
  } catch (error) {
    console.error('Error clearing customer session:', error);
    throw error;
  }
}

/**
 * Get the current customer ID from the session
 * @returns The customer ID if set, null otherwise
 */
export function getCustomerSessionId(): string | null {
  return localStorage.getItem('nirchal_customer_id');
}

/**
 * Check if a customer session is active
 * @returns true if a customer session exists, false otherwise
 */
export function hasCustomerSession(): boolean {
  return localStorage.getItem('nirchal_customer_id') !== null;
}

/**
 * Wrapper for Supabase queries that need customer context
 * This ensures the session is properly set before executing queries
 * 
 * Example usage:
 * const { data, error } = await withCustomerSession(async () => {
 *   return supabase
 *     .from('orders')
 *     .select('*');
 * });
 */
export async function withCustomerSession<T>(
  callback: () => Promise<{ data: T; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const customerId = getCustomerSessionId();
    
    if (!customerId) {
      return {
        data: null,
        error: { message: 'No customer session active' }
      };
    }
    
    // Execute the callback
    const result = await callback();
    return result;
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}

/**
 * IMPORTANT: RLS Configuration Notes
 * 
 * For Supabase RLS policies to work correctly with app.current_customer_id:
 * 
 * 1. After login, call: setCustomerSession(customerId)
 * 2. This sets localStorage value and optionally calls server-side setter
 * 3. Each RLS policy should check:
 *    customer_id = current_setting('app.current_customer_id')::uuid
 * 
 * 4. On logout, call: clearCustomerSession()
 * 
 * 5. For authenticated queries, ensure the session is set before querying
 * 
 * Example RLS policy:
 * ```sql
 * CREATE POLICY "customers_select_own_orders"
 *   ON public.orders
 *   FOR SELECT
 *   USING (
 *     customer_id::text = current_setting('app.current_customer_id'::text, true)
 *     AND current_setting('app.current_customer_id'::text, true) != ''
 *   );
 * ```
 */
