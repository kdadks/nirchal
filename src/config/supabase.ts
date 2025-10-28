
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

// Simple singleton pattern - the warning in dev is due to HMR, but it's harmless
let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

// Suppress multiple client warnings (occurs due to HMR in dev or strict mode in prod)
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Multiple GoTrueClient instances detected')) {
    return; // Suppress this harmless warning
  }
  originalWarn.apply(console, args);
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

// Admin client for privileged operations
function getSupabaseAdminClient() {
  if (!supabaseServiceKey) return null;
  
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'nirchal-admin-auth'
      }
    });
  }
  return supabaseAdminInstance;
}

// Export the singleton instances
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

