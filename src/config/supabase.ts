
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEYS;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Simple singleton pattern - the warning in dev is due to HMR, but it's harmless
let supabaseInstance: SupabaseClient | null = null;

// Suppress multiple client warnings (occurs due to HMR in dev or strict mode in prod)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Multiple GoTrueClient instances detected')) {
    return; // Suppress this harmless warning
  }
  // Suppress network errors on localhost (expected during development)
  if (window.location.hostname === 'localhost' && args[0]?.includes?.('Failed to')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Suppress the stale-token refresh error on localhost (Supabase clears it automatically)
const originalError = console.error;
console.error = (...args) => {
  if (window.location.hostname === 'localhost' &&
      args[0]?.message?.includes?.('Invalid Refresh Token')) {
    return;
  }
  originalError.apply(console, args);
};

// Regular client for public operations
function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'nirchal-auth'
      }
    });
  }
  return supabaseInstance;
}

// Admin client — uses the same authenticated client as regular client.
// sb_secret_* keys cannot be used in the browser ("Forbidden use of secret API key in browser").
// Admin operations use the user's session JWT with RLS policies instead.
const supabase = getSupabaseClient();
export { supabase };
// Admin client — uses the same authenticated client as regular client.
// sb_secret_* keys cannot be used in the browser ("Forbidden use of secret API key in browser").
// Admin operations use the user's session JWT with RLS policies instead.
export const supabaseAdmin: SupabaseClient | null = supabase;

