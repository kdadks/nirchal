import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const { supabase } = useAuth();
  const [data, setData] = useState<ContentTypeMap[T][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  if (import.meta.env.DEV) console.debug(`[useContent] fetching ${type} data...`);
      if (!supabase) {
        setError('Supabase client not initialized');
        setLoading(false);
        setData([]);
        return;
      }
      if (import.meta.env.DEV) {
        console.debug('[useContent] supabase client:', !!supabase);
        console.debug('[useContent] table name:', tableMap[type]);
      }

      const { data: result, error: err } = await supabase
        .from(tableMap[type])
        .select('*')
        .order('order_num');

      if (import.meta.env.DEV) {
        console.debug(`[useContent] ${type} result:`, result);
        console.debug(`[useContent] ${type} error:`, err);
      }

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
  }, [supabase, type]);

  useEffect(() => {
    fetchContent();
    // Only refetch when supabase or type changes
  }, [fetchContent]);

  return { data, loading, error, refetch: fetchContent };
}
