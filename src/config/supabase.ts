
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging for development
if (typeof window !== 'undefined') {
	if (import.meta.env.DEV) {
		console.debug('[Supabase Config] env:', import.meta.env.MODE);
		console.debug('[Supabase Config] url:', supabaseUrl);
		console.debug('[Supabase Config] anon key (first 20):', supabaseAnonKey?.substring(0, 20) + '...');
		console.debug('[Supabase Config] url valid:', !!(supabaseUrl && supabaseUrl.startsWith('https://')));
		console.debug('[Supabase Config] key valid:', !!(supabaseAnonKey && supabaseAnonKey.length > 50));
	}
}

if (!supabaseUrl || !supabaseAnonKey) {
	console.error('[Supabase Config] Missing environment variables!');
	console.error('[Supabase Config] URL:', supabaseUrl);
	console.error('[Supabase Config] Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

