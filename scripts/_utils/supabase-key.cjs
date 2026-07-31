/**
 * Shared Supabase key helper for Node.js scripts (CommonJS)
 *
 * Uses the new SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS
 * JSON-based environment variables. No fallback to deprecated keys.
 *
 * Usage:
 *   const { getSupabaseServiceKey, getSupabasePublishableKey } = require('./_utils/supabase-key.cjs');
 */

const parseKeys = (envVar) => {
  const raw = process.env[envVar];
  if (!raw) {
    throw new Error(`${envVar} is not set`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse ${envVar}: ${e}`);
  }
};

/**
 * Get the service role key from SUPABASE_SECRET_KEYS (JSON: {"default": "key"}).
 * Throws if the key is not configured.
 */
function getSupabaseServiceKey() {
  const keys = parseKeys('SUPABASE_SECRET_KEYS');
  const key = keys['default'];
  if (!key) {
    throw new Error('SUPABASE_SECRET_KEYS does not contain a default key');
  }
  return key;
}

/**
 * Get the publishable/anon key from SUPABASE_PUBLISHABLE_KEYS (JSON: {"default": "key"}).
 * Throws if the key is not configured.
 */
function getSupabasePublishableKey() {
  const keys = parseKeys('SUPABASE_PUBLISHABLE_KEYS');
  const key = keys['default'];
  if (!key) {
    throw new Error('SUPABASE_PUBLISHABLE_KEYS does not contain a default key');
  }
  return key;
}

module.exports = { getSupabaseServiceKey, getSupabasePublishableKey };
