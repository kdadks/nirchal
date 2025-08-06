import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Log initialization
console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? 'present' : 'missing'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export table names
export const tables = {
  about: 'about_sections',
  faqs: 'faqs',
  privacy: 'privacy_sections',
  contact: 'contact_info',
  products: 'products'
} as const;

// TypeScript types for our database schema
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
