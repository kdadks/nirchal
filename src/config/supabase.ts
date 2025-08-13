
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for development
if (typeof window !== 'undefined') {
	console.log('[Supabase Config] Environment:', import.meta.env.MODE);
	console.log('[Supabase Config] URL:', supabaseUrl);
	console.log('[Supabase Config] Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');
	console.log('[Supabase Config] URL valid:', !!(supabaseUrl && supabaseUrl.startsWith('https://')));
	console.log('[Supabase Config] Key valid:', !!(supabaseAnonKey && supabaseAnonKey.length > 50));
}

if (!supabaseUrl || !supabaseAnonKey) {
	console.error('[Supabase Config] Missing environment variables!');
	console.error('[Supabase Config] URL:', supabaseUrl);
	console.error('[Supabase Config] Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

