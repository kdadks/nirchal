
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
	// Log only in production browser for debugging
	// eslint-disable-next-line no-console
	console.log('[Supabase] VITE_SUPABASE_URL:', supabaseUrl);
	// eslint-disable-next-line no-console
	console.log('[Supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

