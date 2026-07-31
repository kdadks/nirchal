/**
 * Shared Supabase key helper for Cloudflare Pages Functions
 *
 * Uses the new SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS
 * JSON-based environment variables. No fallback to deprecated keys.
 *
 * Usage in each Cloudflare Pages Function:
 *   import { getSupabaseAdminKey } from './_utils/supabase-client';
 *   const supabase = createClient(env.SUPABASE_URL, getSupabaseAdminKey(env));
 */

/**
 * Extract the service role key from SUPABASE_SECRET_KEYS (JSON: {"default": "key"}).
 * Throws if the key is not configured.
 */
export function getSupabaseAdminKey(env: {
  SUPABASE_SECRET_KEYS: string;
}): string {
  if (!env.SUPABASE_SECRET_KEYS) {
    throw new Error('SUPABASE_SECRET_KEYS is not set');
  }
  try {
    const key = JSON.parse(env.SUPABASE_SECRET_KEYS)['default'];
    if (!key) {
      throw new Error('SUPABASE_SECRET_KEYS does not contain a default key');
    }
    return key;
  } catch (e) {
    throw new Error(`Failed to parse SUPABASE_SECRET_KEYS: ${e}`);
  }
}

/**
 * Extract the publishable key from SUPABASE_PUBLISHABLE_KEYS (JSON: {"default": "key"}).
 * Throws if the key is not configured.
 */
export function getSupabasePublishableKey(env: {
  SUPABASE_PUBLISHABLE_KEYS: string;
}): string {
  if (!env.SUPABASE_PUBLISHABLE_KEYS) {
    throw new Error('SUPABASE_PUBLISHABLE_KEYS is not set');
  }
  try {
    const key = JSON.parse(env.SUPABASE_PUBLISHABLE_KEYS)['default'];
    if (!key) {
      throw new Error('SUPABASE_PUBLISHABLE_KEYS does not contain a default key');
    }
    return key;
  } catch (e) {
    throw new Error(`Failed to parse SUPABASE_PUBLISHABLE_KEYS: ${e}`);
  }
}
