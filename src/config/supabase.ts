import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const tables = {
  about: 'about_sections',
  faqs: 'faqs',
  privacy: 'privacy_sections',
  contact: 'contact_info',
  products: 'products'
} as const;

// Add TypeScript types for our database schema
export type Tables = {
  about_sections: {
    id: number;
    title: string | null;
    content: string;
    order_num: number;
    created_at: string;
    updated_at: string;
  };
  faqs: {
    id: number;
    category: string;
    question: string;
    answer: string;
    order_num: number;
    created_at: string;
    updated_at: string;
  };
  privacy_sections: {
    id: number;
    title: string | null;
    content: string;
    list_items: string[] | null;
    order_num: number;
    created_at: string;
    updated_at: string;
  };
  contact_info: {
    id: number;
    type: string;
    value: string;
    order_num: number;
    created_at: string;
    updated_at: string;
  };
  products: {
    id: number;
    name: string;
    price: number;
    description: string;
    image_url: string;
    category: string;
    featured: boolean;
    created_at: string;
    updated_at: string;
  };
};