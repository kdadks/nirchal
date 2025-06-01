import { useEffect, useState } from 'react';
import { supabase, tables } from '../config/supabase';

export interface AboutSection {
  id: number;
  title: string | null;
  content: string;
  order: number;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
}

export interface PrivacySection {
  id: number;
  title: string | null;
  content: string;
  list_items: string[] | null;
  order: number;
}

export interface ContactInfo {
  id: number;
  type: string;
  value: string;
  order: number;
}

type ContentType = 'about' | 'faqs' | 'privacy' | 'contact' | 'products';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  featured: boolean;
}

type ContentTypeMap = {
  about: AboutSection;
  faqs: FAQ;
  privacy: PrivacySection;
  contact: ContactInfo;
  products: Product;
};

export function useContent<T extends ContentType>(type: T): {
  data: ContentTypeMap[T][];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ContentTypeMap[T][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data: result, error: err } = await supabase
          .from(tables[type])
          .select('*')
          .order('order_num');

        if (err) throw err;

        // Transform the data to match our interface expectations
        const transformedData = result.map(item => ({
          ...item,
          order: item.order_num,
        })) as ContentTypeMap[T][];

        setData(transformedData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [type]);

  return { data, loading, error };
}