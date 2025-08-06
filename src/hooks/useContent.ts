import { useEffect, useState } from 'react';

import { createClient } from '@supabase/supabase-js';

// Lazy singleton pattern for Supabase client
let supabase: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export interface AboutSection {
  id: number;
  title: string | null;
  content: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface PrivacySection {
  id: number;
  title: string | null;
  content: string;
  list_items: string[] | null;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: number;
  type: string;
  value: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingInfo {
  id: number;
  title: string;
  content: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface ReturnPolicy {
  id: number;
  title: string;
  content: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface Terms {
  id: number;
  title: string;
  content: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}

type ContentType = 'about' | 'faqs' | 'privacy' | 'contact' | 'shipping' | 'return' | 'terms';

type ContentTypeMap = {
  about: AboutSection;
  faqs: FAQ;
  privacy: PrivacySection;
  contact: ContactInfo;
  shipping: ShippingInfo;
  return: ReturnPolicy;
  terms: Terms;
};

const tableMap: Record<ContentType, string> = {
  about: 'about_sections',
  faqs: 'faqs',
  privacy: 'privacy_sections',
  contact: 'contact_info',
  shipping: 'shipping_info',
  return: 'return_policy',
  terms: 'terms'
};

export function useContent<T extends ContentType>(type: T): {
  data: ContentTypeMap[T][];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<ContentTypeMap[T][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchContent() {
    setLoading(true);
    setError(null);
    try {
      console.log(`[useContent] Fetching ${type} data...`);

      const supabase = getSupabaseClient();
      console.log('[useContent] Supabase client:', !!supabase);
      console.log('[useContent] Table name:', tableMap[type]);

      const { data: result, error: err } = await supabase
        .from(tableMap[type])
        .select('*')
        .order('order_num');

      console.log(`[useContent] ${type} Query result:`, result);
      console.log(`[useContent] ${type} Query error:`, err);

      if (err) {
        console.error(`[useContent] Error fetching ${type}:`, err);
        throw err;
      }

      if (!result) {
        console.warn(`[useContent] No ${type} data returned`);
        setData([]);
        return;
      }

      setData(result as unknown as ContentTypeMap[T][]);
    } catch (e) {
      console.error(`[useContent] Error in fetchContent for ${type}:`, e);
      setError(e instanceof Error ? e.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContent();
  }, [type]);

  return { data, loading, error, refetch: fetchContent };
}
