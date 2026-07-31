/**
 * Shared Supabase client factory for Supabase Edge Functions
 *
 * Uses the new SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS
 * JSON-based secrets. No fallback to deprecated keys.
 *
 * Usage in each function:
 *   import { createSupabaseAdmin } from '../_shared/supabase-client.ts';
 *   const supabase = createSupabaseAdmin(Deno.env);
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Create a Supabase admin client (bypasses RLS)
 * Uses SUPABASE_SECRET_KEYS (JSON: {"default": "key"})
 */
export function createSupabaseAdmin(env: {
  get: (key: string) => string | undefined;
}): ReturnType<typeof createClient> {
  const supabaseUrl = env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not set');
  }

  const secretKeysRaw = env.get('SUPABASE_SECRET_KEYS');
  if (!secretKeysRaw) {
    throw new Error('SUPABASE_SECRET_KEYS is not set');
  }

  let supabaseKey: string;
  try {
    supabaseKey = JSON.parse(secretKeysRaw)['default'];
  } catch (e) {
    throw new Error(`Failed to parse SUPABASE_SECRET_KEYS: ${e}`);
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_SECRET_KEYS does not contain a default key');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Create a Supabase client with publishable key (respects RLS)
 * Uses SUPABASE_PUBLISHABLE_KEYS (JSON: {"default": "key"})
 */
export function createSupabaseClient(env: {
  get: (key: string) => string | undefined;
}): ReturnType<typeof createClient> {
  const supabaseUrl = env.get('SUPABASE_URL');
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not set');
  }

  const publishableKeysRaw = env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (!publishableKeysRaw) {
    throw new Error('SUPABASE_PUBLISHABLE_KEYS is not set');
  }

  let supabaseKey: string;
  try {
    supabaseKey = JSON.parse(publishableKeysRaw)['default'];
  } catch (e) {
    throw new Error(`Failed to parse SUPABASE_PUBLISHABLE_KEYS: ${e}`);
  }

  if (!supabaseKey) {
    throw new Error('SUPABASE_PUBLISHABLE_KEYS does not contain a default key');
  }

  return createClient(supabaseUrl, supabaseKey);
}
